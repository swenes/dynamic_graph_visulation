function generateUniqueId() {
    // Örneğin, rasgele bir UUID kullanabilirsiniz.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


function toggleForm() {
    var form = document.getElementById("popupForm");
    var isOpen = form.classList.toggle("active");
    if (isOpen) {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        form.style.top = scrollTop + "px";
        form.style.height = form.scrollHeight + "px";
        form.addEventListener("transitionend", function () {
            form.style.height = "auto";
        }, { once: true });
    } else {
        form.style.height = form.clientHeight + "px";
        setTimeout(function () {
            form.style.height = "0";
        }, 1);
    }
}


function showFields() {
    var nodeType = document.getElementById("nodeType").value;

    var companyFields = document.getElementById("companyFields");
    var departmentFields = document.getElementById("departmentFields");
    var employeeFields = document.getElementById("employeeFields");

    // Tüm alanları gizle
    companyFields.style.display = "none";
    departmentFields.style.display = "none";
    employeeFields.style.display = "none";

    // Seçilen düğüm tipine göre ilgili alanı göster
    if (nodeType === "company") {
        companyFields.style.display = "block";
    }

    else if (nodeType === "department") {
        departmentFields.style.display = "block";

        var companySelectDpt = document.getElementById("companySelectDpt");
        companySelectDpt.innerHTML = ""; // Önceki seçenekleri temizle

        //ilk opsiyonumuz seçim yapınız olmalı
        var option = document.createElement("option");
        option.text = '--Seçiniz--';
        option.value = "";
        companySelectDpt.add(option);


        // AJAX isteğiyle nodes endpointinden veriyi al
        fetch('http://localhost:3000/nodes')
            .then(response => response.json())
            .then(nodesData => {
                // Nodes'daki düğümleri al
                var nodes = nodesData.types.head.concat(nodesData.types.company).concat(nodesData.types.department).concat(nodesData.types.employee);

                // Şirketleri listele
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].type === "company") {
                        var option = document.createElement("option");
                        option.text = nodes[i].name;
                        option.value = nodes[i].name;
                        companySelectDpt.add(option);
                    }
                }
            })
            .catch(error => {
                console.error('Data alınamadı:', error);
            });
    }

    else if (nodeType === "employee") {
        employeeFields.style.display = "block";

        var companySelectEmp = document.getElementById("companySelectEmp");
        var departmentSelectEmp = document.getElementById("departmentSelectEmp");

        // Önceki seçenekleri temizle
        companySelectEmp.innerHTML = "";
        departmentSelectEmp.innerHTML = "";


        // AJAX isteğiyle nodes endpointinden veriyi al
        // Nodes ve Links verilerini aynı anda al
        Promise.all([
            fetch('http://localhost:3000/nodes').then(response => response.json()),
            fetch('http://localhost:3000/links').then(response => response.json())
        ])
            .then(([nodesData, linksData]) => {
                // Nodes ve Links verileri burada kullanılabilir

                // Nodes'daki düğümleri al
                var nodes = nodesData.types.head.concat(nodesData.types.company).concat(nodesData.types.department).concat(nodesData.types.employee.workers).concat(nodesData.types.employee.teamLeads);
                var links = linksData;

                // İlk olarak "Seçiniz" seçeneğini ekleyelim
                var defaultOption = document.createElement("option");
                defaultOption.text = '-- Şirket Seçiniz --';
                defaultOption.value = "";
                companySelectEmp.add(defaultOption);

                // Şirketleri listele
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].type === "company") {
                        var option = document.createElement("option");
                        option.text = nodes[i].name;
                        option.value = nodes[i].name;
                        companySelectEmp.add(option);
                    }
                }

                // departmanları listeleme işlemi
                companySelectEmp.addEventListener('change', function () {
                    var selectedCompany = companySelectEmp.value;
                    const selectedCompanyID = nodesData.types.company.find(node => node.name === selectedCompany).id;
                    const allNodes = [
                        ...nodesData.types.head,
                        ...nodesData.types.company,
                        ...nodesData.types.department,
                        ...nodesData.types.employee.workers,
                        ...nodesData.types.employee.teamLeads,
                    ];
                    
                    departmentSelectEmp.innerHTML = ""; // Önceki seçenekleri temizle
                        // --Seçiniz-- seçeneğini ekleyelim
                        var defaultOption = document.createElement("option");
                        defaultOption.text = '--Seçiniz--';
                        defaultOption.value = "";
                        departmentSelectEmp.add(defaultOption);

                    // Bağlı olduğu şirkete ait departmanları listele
                    for (var j = 0; j < links.length; j++) {
                        if (links[j].source === selectedCompanyID) {
                            var departmentId = links[j].target; // Hedef düğümün ID'sini al
                            
                            // Hedef düğümünün ID'siyle ilgili düğümü bul
                            var departmentNode = allNodes.find(node => node.id === departmentId);
                            if (departmentNode) {
                                var departmentName = departmentNode.name; // Hedef düğümün ismini al
                                var option2 = document.createElement("option");
                                option2.text = departmentName;
                                option2.value = departmentName;
                                departmentSelectEmp.add(option2);
                            }
                        }
                    }
                },

                departmentSelectEmp.addEventListener('change', function () {
                    var selectedDepartment = departmentSelectEmp.value;
                
                    // Takım liderlerini listeleme işlemi
                    var teamLeads = nodes.filter(node => node.type === 'teamLeads' && node.parentDepartment === selectedDepartment);
                    var teamLeadSelect = document.getElementById("allTeamLeads");
                
                    // Önce mevcut seçenekleri temizleyelim
                    teamLeadSelect.innerHTML = "";
                
                    // --Seçiniz-- seçeneğini ekleyelim
                    var defaultOption = document.createElement("option");
                    defaultOption.text = '--Seçiniz--';
                    defaultOption.value = "";
                    teamLeadSelect.add(defaultOption);
                
                    // Takım liderlerini seçeneklere ekleyelim
                    for (var i = 0; i < teamLeads.length; i++) {
                        var option = document.createElement("option");
                        option.text = teamLeads[i].name; // Takım liderinin adı veya benzersiz bir kimliği
                        option.value = teamLeads[i].id; // Takım liderinin benzersiz bir kimliği
                        teamLeadSelect.add(option);
                    }
                })
                );

            }
            )
            .catch(error => {
                console.error('Veriler alınamadı:', error);
            }
            );
    }
}


    
async function addNode() {
    try {
        const nodeType = document.getElementById("nodeType").value;

        const nodesResponse = await fetch('http://localhost:3000/nodes');
        if (!nodesResponse.ok) {
            throw new Error('Network response was not ok');
        }
        const nodesData = await nodesResponse.json();

        const linksResponse = await fetch('http://localhost:3000/links');
        if (!linksResponse.ok) {
            throw new Error('Network response was not ok');
        }
        const linksData = await linksResponse.json();

        if (!nodeType) {
            alert("Lütfen eklenecek düğüm tipini seçiniz!");
            return;
        }

        // Boş alan kontrolü
        switch (nodeType) {
            case "company":
                const name = document.getElementById("companyName").value;
                const logo = document.getElementById("logoURL").value;
                const kurulusTarihi = document.getElementById("foundationDate").value;
                const ceo = document.getElementById("ceoName").value;
                const cto = document.getElementById("ctoName").value;
                const vizyon = document.getElementById("vision").value;
                const misyon = document.getElementById("mission").value;
                const calisanSayisi = document.getElementById("employeeCount").value;

                if (!name || !logo || !kurulusTarihi || !ceo || !cto || !vizyon || !misyon || !calisanSayisi) {
                    alert("Lütfen boş alanları doldurunuz!");
                    return;
                }

                var newNode = {
                    "id": generateUniqueId(),
                    "name": name,
                    "type": "company",
                    "logo": logo,
                    "kurulusTarihi": kurulusTarihi,
                    "ceo": ceo,
                    "cto": cto,
                    "vizyon": vizyon,
                    "misyon": misyon,
                    "calisanSayisi": calisanSayisi
                };
                break;

            case "department":
                const selectedCompany = document.getElementById("companySelectDpt").value;
                const departmentName = document.getElementById("departmentName").value;

                if (!selectedCompany || !departmentName) {
                    alert("Lütfen boş alanları doldurunuz!");
                    return;
                }

                var newNode = {
                    "id": generateUniqueId(),
                    "name": departmentName,
                    "type": "department",
                    "parentCompany": selectedCompany
                };
                break;

            case "employee":
                var selectedCompanyEmp = document.getElementById("companySelectEmp").value;
                var selectedDepartmentEmp = document.getElementById("departmentSelectEmp").value;
                var isTeamLead = document.getElementById("isTeamLead").value;
                var sicil = document.getElementById("sicleNumber").value;
                var employeeName = document.getElementById("employeeName").value;
                var birthOfDay = document.getElementById("birthOfDay").value;
                var university = document.getElementById("graduate").value;
                var schoolDepartment = document.getElementById("schoolDepartment").value;
                var jobStartDate = document.getElementById("jobStartDate").value;
                var position = document.getElementById("position").value;
                var sex = document.getElementById("sex").value;
                var hometown = document.getElementById("hometown").value;
                var profilePictureURL = document.getElementById("profilePictureURL").value;

                if (!selectedCompanyEmp || !selectedDepartmentEmp || !sicil || !employeeName || !university || !schoolDepartment || !position || !sex || !hometown || !profilePictureURL) {
                    alert("Lütfen boş alanları doldurunuz!");
                    return;
                }

                if (isTeamLead === "true") {
                    var newNode = {
                        "id": generateUniqueId(),
                        "type": "teamLeads",
                        "parentCompany": selectedCompanyEmp,
                        "parentDepartment": selectedDepartmentEmp,
                        "isTeamLead": "true",
                        "sicil": sicil,
                        "name": employeeName,
                        "birth_of_day": birthOfDay,
                        "university": university,
                        "school_department": schoolDepartment,
                        "job_start_date": jobStartDate,
                        "position": position,
                        "sex": sex,
                        "hometown": hometown,
                        "profile_picture": profilePictureURL,
                    };
                } else {
                    var selectedTeamLeadID = document.getElementById("allTeamLeads").value;
                    if (!selectedTeamLeadID) {
                        alert("Lütfen bir takım lideri seçiniz!");
                        return;
                    }

                    var newNode = {
                        "id": generateUniqueId(),
                        "type": "workers",
                        "parentCompany": selectedCompanyEmp,
                        "parentDepartment": selectedDepartmentEmp,
                        "isTeamLead": "false",
                        "parentLead": nodesData.types.employee.teamLeads.find(data => data.id === selectedTeamLeadID).name,
                        "sicil": sicil,
                        "name": employeeName,
                        "birth_of_day": birthOfDay,
                        "university": university,
                        "school_department": schoolDepartment,
                        "job_start_date": jobStartDate,
                        "position": position,
                        "sex": sex,
                        "hometown": hometown,
                        "profile_picture": profilePictureURL,
                    };
                }
                break;

            default:
                throw new Error("Lütfen önce eklenecek düğüm tipini seçiniz!");
        }



        // Yeni düğüm ve bağlantıları nodesData ve linksData'ya ekleme
        switch (nodeType) {
            case "company":
                nodesData.types.company.push(newNode);
                newLink = {
                    "source": "1a",
                    "target": newNode.id,
                };
                linksData.push(newLink);
                break;

            case "department":
                const selectedCompanyDpt = document.getElementById("companySelectDpt").value;
                nodesData.types.department.push(newNode);
                newLink = {
                    "source": nodesData.types.company.find(node => node.name === selectedCompanyDpt).id,
                    "target": newNode.id,
                };
                linksData.push(newLink);
                break;

            case "employee":
                if (isTeamLead === "true") {
                    nodesData.types.employee.teamLeads.push(newNode);
                    newLink = {
                        "source": newNode.id,
                        "target": nodesData.types.department.find(node => node.name === selectedDepartmentEmp).id,
                    };
                } else {
                    nodesData.types.employee.workers.push(newNode);
                    newLink = {
                        "source": nodesData.types.employee.teamLeads.find(data => data.id === selectedTeamLeadID).id,
                        "target": newNode.id
                    };
                }
                linksData.push(newLink);
                break;

            default:
                break;
        }

        // Yeni düğüm ve bağlantıları sunucuya gönderme
        switch (newNode.type) {
            case "company":
                await Promise.all([
                    fetch(`http://localhost:3000/nodes/types/${newNode.type}`, {
                        method: 'POST',
                        body: JSON.stringify(newNode),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch('http://localhost:3000/links', {
                        method: 'POST',
                        body: JSON.stringify(newLink),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                ]);
                break;

            case "department":
                await Promise.all([
                    fetch(`http://localhost:3000/nodes/types/${newNode.type}`, {
                        method: 'POST',
                        body: JSON.stringify(newNode),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch('http://localhost:3000/links', {
                        method: 'POST',
                        body: JSON.stringify(newLink),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                ]);
                break;

            case "workers":
                await Promise.all([
                    fetch(`http://localhost:3000/nodes/types/employee/workers`, {
                        method: 'POST',
                        body: JSON.stringify(newNode),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch('http://localhost:3000/links', {
                        method: 'POST',
                        body: JSON.stringify(newLink),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                ]);
                break;

            case "teamLeads":
                await Promise.all([
                    fetch(`http://localhost:3000/nodes/types/employee/teamLeads`, {
                        method: 'POST',
                        body: JSON.stringify(newNode),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch('http://localhost:3000/links', {
                        method: 'POST',
                        body: JSON.stringify(newLink),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                ]);
                break;

            default:
                break;
        }

        alert('Yeni düğüm başarıyla eklendi!');
        location.reload();
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        alert('Düğüm eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}



document.addEventListener('DOMContentLoaded', function() {
    // form.html dosyasının içeriğini yükle
    fetch('form.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('popupForm').innerHTML = html;
        })
        .catch(error => {
            console.error('Form yüklenirken bir hata oluştu:', error);
        });
});


function showTeamLeadSelect() {
    var isTeamLead = document.getElementById("isTeamLead").value;
    var teamLeadSelect = document.getElementById("teamLeadSelect");

    if (isTeamLead === "false") {
        teamLeadSelect.style.display = "block";
    } else {
        teamLeadSelect.style.display = "none";
    }
}