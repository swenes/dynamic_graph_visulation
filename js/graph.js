let popup; // Popup değişkenini global olarak tanımlıyoruz
let editMode = false; // Düzenleme modunu takip etmek için bir değişken
let deleteMode = false; // Silme modunu takip etmek için bir değişken
let messageShown = false;

// JSON dosyasını yükleme
Promise.all([
    fetch('http://localhost:3000/nodes').then(response => response.json()),
    fetch('http://localhost:3000/links').then(response => response.json())
]).then(([nodesData, linksData]) => {
    // SVG genişlik ve yükseklik ayarları
    const width = 850;
    const height = 620;

    const colorScale = d3.scaleOrdinal()
        .domain(["head", "company", "department", "workers", "teamLeads"])
        .range(["red", "blue", "green", "orange", "purple"]);

    const sizeScale = d3.scaleOrdinal()
        .domain(["head", "company", "department", "workers", "teamLeads"])
        .range([140, 120, 80, 60, 70]);

    // SVG containerını seçme
    const svgContainer = d3.select("#organizationChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("click", backgroundClicked);

    // G öğesini oluştur
    const svg = svgContainer.append("g");

    // Düğümleri oluşturma
    const nodes = svg.selectAll(".node")
        .data(nodesData.types.head.concat(nodesData.types.company).concat(nodesData.types.department).concat(nodesData.types.employee.workers).concat(nodesData.types.employee.teamLeads))
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${Math.random()},${Math.random()})`)
        .call(d3.drag() // Sürükle ve bırak davranışını ekleme
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", function (event, d) {
            if (deleteMode || editMode) {
                // Eğer deleteMode veya editMode aktifse, nodeClicked fonksiyonunu çağır
                nodeClicked(event, d);
            } else {
                // Herhangi bir mod aktif değilse, toggleDetails fonksiyonunu çağır
                toggleDetails(event, d);
            }
        })
        .style("cursor", "pointer");


    // Düğümlere fotoğraf ekleme
    nodes.append("circle")
        .attr("r", d => sizeScale(d.type) / 2) // Düğüm yarıçapının yarısı kadar daire oluşturur
        .style("fill", "white") // Arka planı beyaz yap
        .style("stroke", d => colorScale(d.type)) // Kenar rengini düğüm türüne göre ayarla
        .style("stroke-width", 6); // Kenar kalınlığını belirle
    // Düğümlerin içine resim eklemek için clipPath tanımlama
    const clipPaths = nodes.append("clipPath")
        .attr("id", (d, i) => `clip${i}`); // Her düğüm için benzersiz bir clipPath tanımlayın

    // ClipPath içine daire yerleştirme
    clipPaths.append("circle")
        .attr("r", d => sizeScale(d.type) / 2);

    // Resimleri clipPath'e bağlama
    nodes.append("image")
        .attr("xlink:href", function (d) {
            // Fotoğraf URL'lerini d.type'e göre belirle
            if (d.type === "head") {
                return d.logo;
            } else if (d.type === "company") {
                return d.logo;
            }
            else if (d.type === "department") {
                return "../assets/department.png";

            } else if (d.type == "workers" || d.type == "teamLeads") {
                return d.profile_picture;
            } else {
                // Diğer durumlarda varsayılan bir fotoğraf kullanabilirsiniz
                return "../assets/wallpaper/grundig.png"
            }
        })
        .attr("clip-path", (d, i) => `url(#clip${i})`) // Her düğüm için uygun clipPath'i seçme
        .attr("x", d => -sizeScale(d.type) / 2)
        .attr("y", d => -sizeScale(d.type) / 2)
        .attr("width", d => sizeScale(d.type))
        .attr("height", d => sizeScale(d.type));

    nodes.append("title")
        .text(function (d) {
            if (d.type === "company" || d.type == "head") {
                return d.name + "\nCEO: " + d.ceo + "\nCTO: " + d.cto + "\nKuruluş Tarihi: " + d.kurulusTarihi;
            } else {
                return d.name;
            }
        });
    // Şirketlere ait renklerin tanımlanması
    const departmentColors = {
        "AR-GE": "blue",
        "İnsan Kaynakları": "cyan",
        "Yazılım": "green",
        "Pazarlama": "orange",
    };


    // Bağlantıları oluşturma
    const links = svg.selectAll(".link")
        .data(linksData)
        .enter()
        .append("line")
        .attr("class", "link")
        .style("stroke", d => departmentColors[findNodeNameById(d.target, d)] || "black")
        .style("stroke-width", 6)
        .attr("marker-end", "url(#arrow)")
        .lower();

    // D3.js ile çiçek demeti düzeni
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3; // Dairesel yerleşim için yarıçap belirleyin

    // Düğüm sayısı
    const totalNodes = nodesData.types.head.length + nodesData.types.company.length + nodesData.types.department.length + nodesData.types.employee.workers.length + nodesData.types.employee.teamLeads.length;

    // Düğüm yerleşimi
    nodesData.types.head.concat(nodesData.types.company).concat(nodesData.types.department)
        .concat(nodesData.types.employee.workers).concat(nodesData.types.employee.teamLeads)
        .forEach((node, index) => {
            // Dairesel yerleşim için düğüm açısını hesaplayın
            const angle = (index / totalNodes) * 2 * Math.PI;

            // Polar koordinatları kullanarak düğüm konumlarını belirleyin
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
        });

    const simulation = d3.forceSimulation()
        .nodes(nodesData.types.head
            .concat(nodesData.types.company)
            .concat(nodesData.types.department)
            .concat(nodesData.types.employee.workers)
            .concat(nodesData.types.employee.teamLeads))
        .force("link", d3.forceLink(linksData)
            .id(d => d.id)
            .distance(200)) // Bağ uzunluğunu ayarlayın
        .force("charge", d3.forceManyBody()
            .strength(-400)) // İtme kuvvetini ayarlayın
        .force("center", d3.forceCenter(centerX, centerY))
        .force("collide", d3.forceCollide()
            .radius(50) // Çarpışma yarıçapını ayarlayın
            .iterations(4)); // Çarpışma kuvveti için iterasyon sayısını ayarlayın

    // Simülasyonun her adımında güncelleme
    simulation.on("tick", () => {
        links.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodes.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Zoom işlevselliğini tanımlama
    const zoom = d3.zoom()
        .scaleExtent([0.1, 10]) // Minimum ve maksimum yakınlaştırma değerleri
        .on("zoom", zoomed);

    // Zoom fonksiyonu
    function zoomed(event) {
        svg.attr("transform", event.transform);
    }

    // Düğümü Sürükleme başladığında
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart(); // Simülasyonu yeniden başlat
        d.fx = d.x;
        d.fy = d.y;
    }

    // Düğümü Sürükleme sırasında
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    // Düğümü Sürükleme bittiğinde
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Arka plan ile sürükleme, gezinme işlevi
    function backgroundClicked() {
        // Eğer arka plana tıklanırsa, gezinme işlevselliğini etkinleştir
        svgContainer.call(zoom);
    }


    function findNodeNameById(targetID, d) {
        let node;

        const allNodes = [
            ...nodesData.types.head,
            ...nodesData.types.company,
            ...nodesData.types.department,
            ...nodesData.types.employee.workers,
            ...nodesData.types.employee.teamLeads,
        ];
        var targetType = allNodes.find(d => d.id === targetID).type;

        switch (targetType) {
            case "company":
                node = nodesData.types.company.find(node => node.id === targetID);
                return node ? node.name : null;
            case "department":
                node = nodesData.types.department.find(node => node.id === targetID);
                return node ? node.name : null;
            case "workers":
                // Çalışanlar için parentCompany'i al
                node = nodesData.types.employee.workers.find(node => node.id === targetID);
                return node ? node.parentDepartment : null;
            case "teamLeads":
                // Takım liderleri için parentCompany'i al
                node = nodesData.types.employee.teamLeads.find(node => node.id === targetID);
                return node ? node.parentDepartment : null;
            default:
                return null;
        }

    }
    // Düğümlere tıklandığında çalışanlarla ilgili bilgileri gösteren bir form oluşturma
    function toggleDetails(event, d) {
        if (!popup || popup.datum() !== d) {
            if (popup) {
                popup.remove(); // Eğer farklı bir düğme tıklanmışsa, popup'ı kapat
                popup = null; // Popup değişkenini sıfırla
            }
            createPopup(d); // Yeni düğüm için popup oluştur
        } else {
            popup.remove(); // Eğer aynı düğme tıklanırsa, popup'ı kapat
            popup = null; // Popup değişkenini sıfırla
        }
    }
    // Yeni bir popup oluşturma işlevi
    function createPopup(d) {
        // Popup penceresini oluştur
        popup = d3.select("body")
            .append("div")
            .attr("class", "popup");

        // Popup içeriğini oluştur
        let form;
        if (d.type === "workers") {
            form = `
            <h2>Çalışan Detayları</h2>
            <div class="image-container" style="width: 128px; height: 128px; overflow: hidden; position: relative; padding-left:75px;">
            <img src="${d.profile_picture}" alt="Profil Resmi" style="position: relative; top: 40%; left: 50%; transform: translate(-50%, -50%); max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <p><strong>Adı Soyadı:</strong> ${d.name}</p>
            <p><strong>Sicil Numarası:</strong> ${d.sicil}</p>
            <p><strong>Üniversite:</strong> ${d.university}</p>
            <p><strong>Bölüm:</strong> ${d.school_department}</p>
            <p><strong>Çalıştığı Şirket:</strong> ${d.parentCompany}</p>
            <p><strong>Çalıştığı Departman:</strong> ${d.parentDepartment}</p>
            <p><strong>Bağlı Olunan Ekip Lideri:</strong> ${d.parentLead}</p>
            <p><strong>Pozisyonu:</strong> ${d.position}</p>
            <p><strong>İşe Başlama Tarihi:</strong> ${d.job_start_date}</p>
            <p><strong>Doğum Tarihi:</strong> ${d.birth_of_day}</p>
            <p><strong>Memleketi:</strong> ${d.hometown}</p>
            <p><strong>Cinsiyet:</strong> ${d.sex}</p>
            `;
        } else if (d.type === "teamLeads") {
            form = `
            <h2>Takım Lideri Detayları</h2>
            <div class="image-container" style="width: 128px; height: 128px; overflow: hidden; position: relative; padding-left:75px;">
            <img src="${d.profile_picture}" alt="Profil Resmi" style="position: relative; top: 40%; left: 50%; transform: translate(-50%, -50%); max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <p><strong>Adı Soyadı:</strong> ${d.name}</p>
            <p><strong>Sicil Numarası:</strong> ${d.sicil}</p>
            <p><strong>Üniversite:</strong> ${d.university}</p>
            <p><strong>Bölüm:</strong> ${d.school_department}</p>
            <p><strong>Çalıştığı Şirket:</strong> ${d.parentCompany}</p>
            <p><strong>Çalıştığı Departman:</strong> ${d.parentDepartment}</p>
            <p><strong>Pozisyonu:</strong> ${d.position}</p>
            <p><strong>İşe Başlama Tarihi:</strong> ${d.job_start_date}</p>
            <p><strong>Doğum Tarihi:</strong> ${d.birth_of_day}</p>
            <p><strong>Memleketi:</strong> ${d.hometown}</p>
            <p><strong>Cinsiyet:</strong> ${d.sex}</p>
            `;
        } else if (d.type === "department") {
            form = `
                <h2><strong>${d.name} Departmanı</strong> </h2>
            `;
        }
        else if (d.type === "company") {
            const vizyonSatirlar = d.vizyon.match(/.{1,40}(\s|$)/g); // 60 karaktere kadar satırı böl
            const misyonSatirlar = d.misyon.match(/.{1,40}(\s|$)/g); // 60 karaktere kadar satırı böl
            form = `
             <div class="image-container" style="padding-left: 60px;width: 140px; height: 140px; overflow: hidden;">
             <img src="${d.logo}" alt="Profil Resmi" style="width: 100%; height: 100%; object-fit: contain;">
         </div>
            <h2>Şirket Detayları</h2>
            <p><strong>Şirket Adı:</strong> ${d.name}</p>
            <p><strong>Kuruluş Tarihi:</strong> ${d.kurulusTarihi}</p>
            <p><strong>CEO:</strong> ${d.ceo}</p>
            <p><strong>CTO:</strong> ${d.cto}</p>
            <p><strong>Vizyon</strong><br>${vizyonSatirlar.join("<br>")}</p>
            <p><strong>Misyon</strong><br>${misyonSatirlar.join("<br>")}</p>
            <p><strong>Çalışan Sayısı:</strong> ${d.calisanSayisi}</p>
        `;
        }
        else if (d.type === "head") {
            const vizyonSatirlar = d.vizyon.match(/.{1,40}(\s|$)/g); // 60 karaktere kadar satırı böl
            const misyonSatirlar = d.misyon.match(/.{1,40}(\s|$)/g); // 60 karaktere kadar satırı böl
            form = `
            <div class="image-container" style="padding-left: 60px;width: 140px; height: 140px; overflow: hidden;">
                <img src="${d.logo}" alt="Profil Resmi" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <h2> ${d.name} Hakkında</h2>
            <p><strong>Şirket Adı:</strong> ${d.name}</p>
            <p><strong>Kuruluş Tarihi:</strong> ${d.kurulusTarihi}</p>
            <p><strong>CEO:</strong> ${d.ceo}</p>
            <p><strong>CTO:</strong> ${d.cto}</p>
            <p><strong>Vizyon</strong><br>${vizyonSatirlar.join("<br>")}</p>
            <p><strong>Misyon</strong><br>${misyonSatirlar.join("<br>")}</p>
            <p><strong>Çalışan Sayısı:</strong> ${d.calisanSayisi}</p>
            `;
        }

        // Popup içeriğini ekle
        popup.html(form);
        // Popup penceresini kapatmak için tıklama olayını dinle
        popup.on("click", function () {
            popup.remove(); // Popup penceresini kapat
            popup = null; // Popup değişkenini sıfırla
        });
    }

    // Mesajı yanıp söndürme fonksiyonu
    function toggleMessage(messageElement) {
        let intervalCount = 0;
        const intervalId = setInterval(() => {
            if (intervalCount < 5) {
                // Mesaj kutusunu görünür veya gizli yap
                messageElement.style.visibility = (intervalCount % 2 === 0) ? 'visible' : 'hidden';
                intervalCount++;
            } else {
                // Aralıklı yanıp söndürme tamamlandı, mesajı kalıcı olarak görünür hale getir
                clearInterval(intervalId); // Interval'ı durdur
                messageElement.style.visibility = 'visible';
            }
        }, 100); // Her 100 milisaniyede bir (0.1 saniye) işlem yap
    }

    // Düzenleme modunu aç veya kapat
    const crudModeMessage = document.getElementById('crudModeMessage');
    const crudModeImage = document.getElementById('crudModeImage');
    function toggleEditMode() {
        if (deleteMode) {
            // Eğer deleteMode aktifse, önce onu kapat
            toggleDeleteMode();
        }
        editMode = !editMode; // editMode durumunu tersine çevir



        if (editMode) {
            document.getElementById('editButton').style.backgroundColor = '#1e7818b0'; // Edit düğmesi arka plan rengini parlak yeşil (#1e7818b0) yap
            crudModeMessage.innerText = 'Düzenlenecek Düğümü Seçebilirsiniz'; // Metin içeriğini güncelle
            crudModeImage.innerText = 'EDIT MODE: ON';
            toggleMessage(crudModeMessage); // Mesajı yanıp söndür
            toggleMessage(crudModeImage); // Mesajı yanıp söndür
        } else {
            console.log("Düzenleme modu kapatıldı.");
            document.getElementById('editButton').style.backgroundColor = 'transparent'; // Edit düğmesi arka plan rengini tekrar şeffaf (eski haline) getir
            crudModeMessage.style.visibility = 'hidden'; // Metni görünmez yap   
            crudModeImage.style.visibility = 'hidden';
        }
    }

    // Silme modunu aç veya kapat
    function toggleDeleteMode() {
        if (editMode) {
            // Eğer editMode aktifse, önce onu kapat
            toggleEditMode();
        }
        deleteMode = !deleteMode; // deleteMode durumunu tersine çevir

        if (deleteMode) {
            document.getElementById('deleteButton').style.backgroundColor = '#1e7818b0'; // Delete düğmesi arka plan rengini parlak yesil (#1e7818b0) yap
            crudModeMessage.innerText = 'Silinecek Düğümü Seçebilirsiniz'; // Metin içeriğini güncelle
            crudModeImage.innerText = 'DELETE MODE: ON';
            toggleMessage(crudModeMessage); // Mesajı yanıp söndür
            toggleMessage(crudModeImage); // Mesajı yanıp söndür
        } else {
            console.log("Silme modu kapatıldı.");
            document.getElementById('deleteButton').style.backgroundColor = 'transparent'; // Delete düğmesi arka plan rengini tekrar şeffaf (eski haline) getir
            crudModeMessage.style.visibility = 'hidden'; // Metni görünmez yap
            crudModeImage.style.visibility = 'hidden';
        }
    }

    // Delete düğmesine tıklandığında silme modunu aç veya kapat
    document.getElementById('deleteButton').addEventListener('click', toggleDeleteMode);

    // Edit düğmesine tıklandığında düzenleme modunu aç veya kapat
    document.getElementById('editButton').addEventListener('click', toggleEditMode);



    function confirmMessageGenerator(d) {
        let message;
        switch (d.type) {
            case "head":
                message = `${d.name} düğümü ana düğümdür. Bu düğümü silerseniz bütün verileriniz silinecektir.\nBu işlem geri alınamaz! \n Devam etmek istiyor musunuz?`
                break;

            case "company":
                message = `${d.name} şirketini silmeyi onayladığınızda şirkete bağlı tüm departmanlar ve çalışanlar silinecektir.\nBu işlem geri alınamaz! \nDevam etmek istiyor musunuz?`
                break;

            case "department":
                message = `${d.name} departmanını silmeyi onayladığınızda departmana bağlı tüm çalışanlar silinecektir.\nBu işlem geri alınamaz! \n Devam etmek istiyor musunuz?`
                break;

            case "workers":
                message = `${d.sicil} sicil numaralı ${d.name} kişisi silinecektir.\nBu işlem geri alınamaz! \n Devam etmek istiyor musunuz?`
                break;

            case "teamLeads":
                message = `${d.sicil} sicil numaralı ${d.name} kişisi bir ekip lideridir. Bu düğümü silerseniz ${d.name} kişisine bağlı tüm çalışanlar direkt olarak departman ile ilişkilendirilecektir .\nBu işlem geri alınamaz! \n Devam etmek istiyor musunuz?`
                break;

            default:
                break;
        }
        return message;
    }


    // Düğüme tıklandığında
    function nodeClicked(event, d) {
        if (deleteMode) {
            showConfirmation(d, confirmMessageGenerator(d));
        }
        else if (editMode) {
            showEditForm(d);
        }
    }
    //for delete operations
    function showConfirmation(nodeData, message) {
        const confirmationOverlay = document.getElementById('confirmationOverlay');
        confirmationOverlay.style.display = 'block';

        const confirmButton = document.getElementById('confirmButtonID');
        const cancelButton = document.getElementById('cancelButtonID');
        const confirmationMessage = document.querySelector('.confirmationMessage');

        // Mesajı dinamik olarak ayarla
        confirmationMessage.textContent = message;
        // Evet'e basıldığında
        confirmButton.onclick = function () {
            switch (nodeData.type) {
                case "head":
                    fetch(`http://localhost:3000/head/${nodeData.id}`, {
                        method: 'DELETE' // HEAD düğümünü silmek için DELETE isteği gönder
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log(`"${nodeData.name}" düğümü başarıyla silindi.`);
                                alert(`"${nodeData.name}" düğümü başarıyla silindi.`);
                                location.reload();
                            } else {
                                console.error(`"${nodeData.name}" düğümü silinemedi.`);
                                alert('Düğüm silme sırasında hata ile karşılaşıldı!');
                            }
                            confirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                        })
                        .catch(error => {
                            console.error('İstek hatası:', error);
                        });
                    break;

                case "company":
                    fetch(`http://localhost:3000/company/${nodeData.id}`, {
                        method: 'DELETE' // Şirketi silmek için DELETE isteği gönder
                    })
                        .then(response => {
                            if (response.ok) {
                                alert(`"${nodeData.name}" şirketi başarıyla silindi.`);
                                location.reload();
                            } else {
                                console.error(`"${nodeData.name}" düğümü silinemedi.`);
                                alert('Düğüm silme sırasında hata ile karşılaşıldı!');
                            }
                            confirmationOverlay.style.display = 'none'; // Onay kutusunu gizle  
                        })
                        .catch(error => {
                            console.error('İstek hatası:', error);
                        });
                    break;

                case "department":
                    fetch(`http://localhost:3000/department/${nodeData.id}`, {
                        method: 'DELETE' // Şirketi silmek için DELETE isteği gönder
                    })
                        .then(response => {
                            if (response.ok) {
                                alert(`"${nodeData.name}" departmanı başarıyla silindi.`);
                                location.reload();
                            } else {
                                console.error(`"${nodeData.name}" düğümü silinemedi.`);
                                alert('Düğüm silme sırasında hata ile karşılaşıldı!');
                            }
                            confirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                        })
                        .catch(error => {
                            console.error('İstek hatası:', error);
                        });
                    break;


                case "workers":
                    fetch(`http://localhost:3000/workers/${nodeData.id}`, {
                        method: 'DELETE' // Şirketi silmek için DELETE isteği gönder
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log();
                                alert(`"${nodeData.name}" adlı çalışan başarıyla silindi.`);
                                location.reload();
                            } else {
                                console.error(`"${nodeData.name}" düğümü silinemedi.`);
                                alert('Düğüm silme sırasında hata ile karşılaşıldı!');
                            }
                            confirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                        })
                        .catch(error => {
                            console.error('İstek hatası:', error);
                        });
                    break;


                case "teamLeads":
                    fetch(`http://localhost:3000/teamLead/${nodeData.id}`, {
                        method: 'DELETE' // Şirketi silmek için DELETE isteği gönder
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log(`"${nodeData.name}" düğümü başarıyla silindi.`);
                                alert(`"${nodeData.name}" adlı takım lideri başarıyla silindi.`);
                                location.reload();
                            } else {
                                console.error(`"${nodeData.name}" düğümü silinemedi.`);
                                alert('Düğüm silme sırasında hata ile karşılaşıldı!');
                            }
                            confirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                        })
                        .catch(error => {
                            console.error('İstek hatası:', error);
                        });
                    break;


                default:
                    console.warn('Belirtilen düğüm türü desteklenmiyor.');
                    confirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                    break;
            }
        };

        // Hayır'a basıldığında
        cancelButton.onclick = function () {
            confirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
        };
    }

    function showEditForm(d) {
        // HTML içeriğini temsil edecek değişken
        let editContent = '';
        let message = '';

        // Düğüm tipine göre HTML içeriğini oluştur
        switch (d.type) {


            case 'workers':
                message = `${d.sicil} Sicil Numaralı ${d.name} Kişisine Ait Veriler`;
                editContent = `
                <div style="text-align: center;">
                <img src="${d.profile_picture}" alt="Profil Resmi" style="max-width: 150px; max-height: 150px; border-radius: 50%;">
               </div>   
               <div class="form-wrapper">
               <div class="left-column">
                   <!-- Sol sütundaki form öğeleri -->
                   <div>
                       <label for="adSoyad">Ad Soyad:</label>
                       <input type="text" id="name" value="${d.name}">
                   </div>
                   <div>
                       <label for="university">Üniversite:</label>
                       <input type="text" id="university" value="${d.university}">
                   </div>
                   <div>
                       <label for="position">Pozisyon:</label>
                       <input type="text" id="position" value="${d.position}">
                   </div>
                   <div>
                       <label for="job_start_date">İşe Başlama Tarihi:</label>
                       <input type="date" id="job_start_date" value="${d.job_start_date}">
                   </div>
                   <div>
                       <label for="bolum">Bölüm:</label>
                       <input type="text" id="school_department" value="${d.school_department}">
                   </div>
                   <div>
                       <label for="profile_picture">Profil Fotoğrafı:</label>
                       <input type="text" id="profile_picture" value="${d.profile_picture}">
                   </div>
               </div>
               <div class="right-column">
                   <div>
                       <label for="parentCompany">Çalıştığı Şirket:</label>
                       <select id="parentCompany">
                           <!-- Şirket seçenekleri dinamik olarak burada yüklenecek -->
                       </select>
                   </div>
                   <div>
                       <label for="parentDepartment">Çalıştığı Departman:</label>
                       <select id="parentDepartment" disabled>
                           <!-- Departman seçenekleri dinamik olarak burada yüklenecek -->
                       </select>
                   </div>
                   <div>
                       <label for="parentLead">Bağlı Olduğu Ekip Lideri:</label>
                       <select id="parentLead" disabled>
                           <!-- Takım lideri seçenekleri dinamik olarak burada yüklenecek -->
                       </select>
                   </div>
                   <div>
                       <label for="sicil">Sicil Numarası:</label>
                       <input type="text" id="sicil" value="${d.sicil}" disabled>
                   </div>
                   <div>
                       <label for="birth_of_day">Doğum Tarihi:</label>
                       <input type="date" id="birth_of_day" value="${d.birth_of_day}">
                   </div>
                   <div>
                       <label for="hometown">Memleket:</label>
                       <input type="text" id="hometown" value="${d.hometown}">
                   </div>
               </div>
           </div>
        </div>
        `;
                break;

            case 'teamLeads':
                message = `${d.sicil} Sicil Numaralı ${d.name} Takım Liderine Ait Veriler`;
                editContent = `
                <div style="text-align: center;">
                 <img src="${d.profile_picture}" alt="Profil Resmi" style="max-width: 150px; max-height: 150px; border-radius: 50%;">
                </div>
                <div class="form-wrapper">
                <div class="left-column">
                    <div>
                        <label for="adSoyad">Ad Soyad:</label>
                        <input type="text" id="name" value="${d.name}">
                    </div>
                    <div>
                        <label for="university">Üniversite:</label>
                        <input type="text" id="university" value="${d.university}">
                    </div>
                    <div>
                        <label for="job_start_date">İşe Başlama Tarihi:</label>
                        <input type="date" id="job_start_date" value="${d.job_start_date}">
                    </div>
                    <div>
                        <label for="bolum">Bölüm:</label>
                        <input type="text" id="school_department" value="${d.school_department}">
                    </div>
                    <div>
                    <label for="profile_picture">Profil Resmi:</label>
                    <input type="text" id="profile_picture" value="${d.profile_picture}">
                </div>

                </div>
                <div class="right-column">
                    <div>
                        <label for="parentCompany">Çalıştığı Şirket:</label>
                        <input type="text" id="parentCompany" value="${d.parentCompany}" disabled>
                     </div>
                     <div>
                        <label for="parentDepartment">Çalıştığı Departman:</label>
                        <input type="text" id="parentDepartment" value="${d.parentDepartment}" disabled>
                    </div>
                    <div>
                    <label for="position">Pozisyon:</label>
                    <input type="text" id="position" value="${d.position}" disabled>
                </div>
                    <div>
                        <label for="birth_of_day">Doğum Tarihi:</label>
                        <input type="date" id="birth_of_day" value="${d.birth_of_day}">
                    </div>
                    <div>
                        <label for="hometown">Memleket:</label>
                        <input type="text" id="hometown" value="${d.hometown}">
                    </div>
                </div>
            </div>
            `;
                break;

            case 'department':
                message = `${d.name} Departmanına Ait Veriler`;
                editContent = `
            <div>
            <label for="name">Departman Adı:</label>
            <input type="text" id="name" value="${d.name}">
            </div>
            <div>
            `
                break;
            case 'company':
                message = `${d.name} Şirketine Ait Veriler`;
                editContent = `
            <div class="image-container" style="width: 128px; height: 128px; overflow: hidden; margin: 0 auto;">
                 <img src="${d.logo}" alt="Profil Resmi" style="padding-top:40px; max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <div class="form-wrapper">
            <div class="left-column">
                <div>
                    <label for="companyName">Şirket Adı:</label>
                    <input type="text" id="name" value="${d.name}">
                </div>
                <div>
                    <label for="ceo">CEO:</label>
                    <input type="text" id="ceo" value="${d.ceo}">
                </div>
                <div>
                    <label for="vizyon">Çalıştığı Departman:</label>
                    <input type="text" id="vizyon" value="${d.vizyon}">
                </div>
                <div>
                    <label for="companyKurulus">Kurulus Tarihi:</label>
                    <input type="date" id="kurulusTarihi" value="${d.kurulusTarihi}">
                </div>
            </div>
            <div class="right-column">
                   <div>
                    <label for="companyLogo">Şirket Logo::</label>
                    <input type="text" id="logo" value="${d.logo}">
                </div>
                <div>
                    <label for="cto">CTO:</label>
                    <input type="text" id="cto" value="${d.cto}">
                </div>

                <div>
                    <label for="misyon">Misyon:</label>
                    <input type="text" id="misyon" value="${d.misyon}">
                </div>
                <div>
                    <label for="calisanSayisi">Çalışan Sayısı:</label>
                    <input type="text" id="calisanSayisi" value="${d.calisanSayisi}">
                </div>
            </div>
        </div>
            `
                break;

            case 'head':
                message = `${d.name} Grubuna Ait Veriler`;
                editContent = `
            <div class="image-container" style="width: 128px; height: 128px; overflow: hidden; margin: 0 auto;">
                   <img src="${d.logo}" alt="Profil Resmi" style="padding-top:40px; max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <div class="form-wrapper">
            <div class="left-column">
                <div>
                    <label for="companyName">Şirket Adı:</label>
                    <input type="text" id="name" value="${d.name}">
                </div>
                <div>
                    <label for="ceo">CEO:</label>
                    <input type="text" id="ceo" value="${d.ceo}">
                </div>
                <div>
                    <label for="vizyon">Çalıştığı Departman:</label>
                    <input type="text" id="vizyon" value="${d.vizyon}">
                </div>
                <div>
                    <label for="companyKurulus">Kurulus Tarihi:</label>
                    <input type="date" id="kurulusTarihi" value="${d.kurulusTarihi}">
                </div>
               
            </div>
            <div class="right-column">
                   <div>
                    <label for="companyLogo">Şirket Logo::</label>
                    <input type="text" id="logo" value="${d.logo}">
                </div>
                <div>
                    <label for="cto">CTO:</label>
                    <input type="text" id="cto" value="${d.cto}">
                </div>

                <div>
                    <label for="misyon">Misyon:</label>
                    <input type="text" id="misyon" value="${d.misyon}">
                </div>
                <div>
                    <label for="calisanSayisi">Çalışan Sayısı:</label>
                    <input type="text" id="calisanSayisi" value="${d.calisanSayisi}">
                </div>
            </div>
        </div>
            `
                break;

            // Diğer case'ler için benzer şekilde devam edebilirsiniz
            default:
                editContent = ''; // Tanımlı olmayan düğüm tipleri için boş içerik
                message = 'Bir Sorun Oluştu';
                break;
        }

        // EditConfirmationBox içeriğini güncelle
        const editConfirmationBox = document.querySelector('.editConfirmationBox');
        editConfirmationBox.innerHTML = `
            <p class="editConfirmationMessage">${message}</p>
            <div class="editContent">${editContent}</div>
            <div class="editConfirmationButtons">
                <button class="editConfirmButton" id="editConfirmButtonID">Güncelle</button>
                <button class="editCancelButton" id="editCancelButtonID">İptal Et</button>
            </div>
        `;

        // EditOverlay'ı görünür yap
        const editConfirmationOverlay = document.getElementById('editConfirmationOverlay');
        editConfirmationOverlay.style.display = 'block';
        editConfirmationOverlay.style.visibility = 'visible';


        if (d.type == 'workers') {
            // Şirketleri yükle
        fetch('http://localhost:3000/nodes/types/company')
        .then(response => response.json())
        .then(data => {
            const parentCompanySelect = document.getElementById('parentCompany');
            
            // Varsayılan şirketi seçeneğini ekle
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Seçiniz';
            parentCompanySelect.add(defaultOption);

            data.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.text = company.name;
                parentCompanySelect.add(option);
            });

        })
        .catch(error => console.error('Error fetching companies:', error));

        // Şirket seçildiğinde departmanları yükle
        document.getElementById('parentCompany').addEventListener('change', function () {
            const companyID = this.value;
            const parentDepartmentSelect = document.getElementById('parentDepartment');
            const parentLeadSelect = document.getElementById('parentLead');

            // Varsayılan "Seçiniz" seçeneğini ekle ve diğer seçenekleri temizle
            parentDepartmentSelect.innerHTML = '';
            const defaultDepartmentOption = document.createElement('option');
            defaultDepartmentOption.value = '';
            defaultDepartmentOption.text = 'Seçiniz';
            parentDepartmentSelect.add(defaultDepartmentOption);

            parentLeadSelect.innerHTML = '';
            const defaultLeadOption = document.createElement('option');
            defaultLeadOption.value = '';
            defaultLeadOption.text = 'Seçiniz';
            parentLeadSelect.add(defaultLeadOption);

            if (companyID) {
                fetch('http://localhost:3000/nodes/types/company')
                    .then(response => response.json())
                    .then(companies => {
                        // Şirket ID'sine göre şirket adını bul
                        const company = companies.find(c => c.id === companyID);
                        if (company) {
                            // Şimdi nodes/types/department'tan şirket adına sahip departmanları bul
                            fetch('http://localhost:3000/nodes/types/department')
                                .then(response => response.json())
                                .then(departments => {
                                    // Şirket adına sahip departmanları ekle
                                    departments.filter(department => department.parentCompany === company.name)
                                        .forEach(department => {
                                            const option = document.createElement('option');
                                            option.value = department.id;
                                            option.text = department.name;
                                            parentDepartmentSelect.add(option);
                                        });

                                    parentDepartmentSelect.disabled = false; // Departman seçeneğini etkinleştir
                                })
                                .catch(error => console.error('Departmanlar yüklenirken bir sorun oluştu:', error));
                        } else {
                            console.error('Şirket Bulunmadı!');
                        }
                    })
                    .catch(error => console.error('Şirketler yüklenirken bir sorun oluştu:', error));
            } else {
                parentDepartmentSelect.disabled = true; // Departman seçeneğini devre dışı bırak
                parentLeadSelect.disabled = true; // Ekip lideri seçeneğini devre dışı bırak
            }
        });

        // Departman seçildiğinde takım liderlerini yükle
        document.getElementById('parentDepartment').addEventListener('change', function () {
            const departmentID = this.value;
            const parentLeadSelect = document.getElementById('parentLead');

            parentLeadSelect.innerHTML = '';
            const defaultLeadOption = document.createElement('option');
            defaultLeadOption.value = '';
            defaultLeadOption.text = 'Seçiniz';
            parentLeadSelect.add(defaultLeadOption);

            if (departmentID) {
                fetch(`http://localhost:3000/nodes/types/department`)
                    .then(response => response.json())
                    .then(departments => {
                        // departman adını eşleştir ve departman ID'sini bul
                        const department = departments.find(d => d.id === departmentID);

                        if (department) {
                            fetch('http://localhost:3000/nodes/types/employee/teamLeads')
                                .then(response => response.json())
                                .then(teamLeads => {
                                    // Departman ID'sine sahip Team Lead'leri listeliyorum.
                                    teamLeads.filter(teamLead => teamLead.parentDepartment === department.name)
                                        .forEach(teamLead => {
                                            const option = document.createElement('option');
                                            option.value = teamLead.id;
                                            option.text = teamLead.name;
                                            parentLeadSelect.add(option);
                                        });

                                    parentLeadSelect.disabled = false; // Takım lideri seçeneğini etkinleştir
                                })
                                .catch(error => console.error('Takım Liderleri yüklenirken bir sorun oluştu:', error));
                        }
                    })
                    .catch(error => console.error('Departmanlar yüklenirken bir sorun oluştu:', error));
            } else {
                parentLeadSelect.disabled = true; // Ekip lideri seçeneğini devre dışı bırak
            }
        });
        }
        // Evet ve Hayır butonlarına tıklama olaylarını ekle
        const editConfirmButtonID = document.getElementById('editConfirmButtonID');
        const editCancelButtonID = document.getElementById('editCancelButtonID');

        editConfirmButtonID.onclick = function () {
            // Formdaki verileri al

            switch (d.type) {
                case 'head':
                    const headName = document.getElementById('name').value;
                    const headCeo = document.getElementById('ceo').value;
                    const headCto = document.getElementById('cto').value;
                    const headKurulusTarihi = document.getElementById('kurulusTarihi').value;
                    const headLogo = document.getElementById('logo').value;
                    const headVizyon = document.getElementById('vizyon').value;
                    const headMisyon = document.getElementById('misyon').value;
                    const headCalisanSayisi = document.getElementById('calisanSayisi').value;
                    // PUT isteği için kullanılacak veri objesi
                    const updatedDataHead = {
                        name: headName,
                        ceo: headCeo,
                        cto: headCto,
                        vizyon: headVizyon,
                        misyon: headMisyon,
                        kurulusTarihi: headKurulusTarihi,
                        logo: headLogo,
                        calisanSayisi: headCalisanSayisi
                    };

                    const requestOptionsHead = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedDataHead)
                    };

                    // fetch isteği gönder
                    fetch(`http://localhost:3000/head/${d.id}`, requestOptionsHead)
                        .then(response => {
                            if (response.ok) {
                                console.log(`${d.name} ana düğümü başarıyla güncellendi`);
                                editConfirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                                location.reload();
                            } else {
                                throw new Error('Ana düğüm güncellenirken bir hata oluştu');
                            }
                        })
                        .catch(error => {
                            console.error('Hata:', error.message);
                            // Hata durumunda gerekli işlemler yapılabilir (ör. hata mesajı gösterme)
                        });

                    break;
                case 'company':

                    const companyName = document.getElementById('name').value;
                    const companyCeo = document.getElementById('ceo').value;
                    const companyCto = document.getElementById('cto').value;
                    const companyKurulusTarihi = document.getElementById('kurulusTarihi').value;
                    const companyLogo = document.getElementById('logo').value;
                    const companyVizyon = document.getElementById('vizyon').value;
                    const companyMisyon = document.getElementById('misyon').value;
                    const companyCalisanSayisi = document.getElementById('calisanSayisi').value;

                    // PUT isteği için kullanılacak veri objesi
                    const updatedDataCompany = {
                        name: companyName,
                        ceo: companyCeo,
                        cto: companyCto,
                        vizyon: companyVizyon,
                        misyon: companyMisyon,
                        kurulusTarihi: companyKurulusTarihi,
                        logo: companyLogo,
                        calisanSayisi: companyCalisanSayisi
                    };

                    const requestOptionsCompany = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedDataCompany)
                    };

                    // fetch isteği gönder
                    fetch(`http://localhost:3000/company/${d.id}`, requestOptionsCompany)
                        .then(response => {
                            if (response.ok) {
                                console.log(`${d.name} şirketi başarıyla güncellendi`);
                                editConfirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                                location.reload();
                            } else {
                                throw new Error('Şirket bilgileri güncellenirken bir hata oluştu');
                            }
                        })
                        .catch(error => {
                            console.error('Hata:', error.message);
                            // Hata durumunda gerekli işlemler yapılabilir (ör. hata mesajı gösterme)
                        });

                    break;
                case 'department':
                    const departmentName = document.getElementById('name').value;
                    const updatedDataDepartment = {
                        name: departmentName,
                    };
                    const requestOptionsDepartment = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedDataDepartment)
                    };

                    // fetch isteği gönder
                    fetch(`http://localhost:3000/department/${d.id}`, requestOptionsDepartment)
                        .then(response => {
                            if (response.ok) {
                                console.log(`${d.name} departmanı güncellendi`);
                                editConfirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                                location.reload();
                            } else {
                                throw new Error('Departman bilgileri güncellenirken bir hata oluştu');
                            }
                        })
                        .catch(error => {
                            console.error('Hata:', error.message);
                            // Hata durumunda gerekli işlemler yapılabilir (ör. hata mesajı gösterme)
                        });
                    break;

                case 'teamLeads':
                    const teamLeadName = document.getElementById('name').value;
                    const teamLeadUniversity = document.getElementById('university').value;
                    const teamLeadJob_start_date = document.getElementById('job_start_date').value;
                    const teamLeadSchool_department = document.getElementById('school_department').value;
                    const teamLeadParentCompany = document.getElementById('parentCompany').value;
                    const teamLeadParentDepartment = document.getElementById('parentDepartment').value;
                    const teamLeadBirth_of_day = document.getElementById('birth_of_day').value;
                    const teamLeadHometown = document.getElementById('hometown').value;
                    const teamLeadProfilePicture = document.getElementById('profile_picture').value;


                    // PUT isteği için kullanılacak veri objesi
                    const updatedDataTeamLead = {
                        name: teamLeadName,
                        university: teamLeadUniversity,
                        job_start_date: teamLeadJob_start_date,
                        school_department: teamLeadSchool_department,
                        parentCompany: teamLeadParentCompany,
                        parentDepartment: teamLeadParentDepartment,
                        birth_of_day: teamLeadBirth_of_day,
                        hometown: teamLeadHometown,
                        profile_picture: teamLeadProfilePicture
                    };
                    const requestOptionsTeamLead = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedDataTeamLead)
                    };

                    // fetch isteği gönder
                    fetch(`http://localhost:3000/teamLead/${d.id}`, requestOptionsTeamLead)
                        .then(response => {
                            if (response.ok) {
                                console.log(`${d.name} başarıyla güncellendi`);
                                editConfirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                                location.reload();
                            } else {
                                throw new Error('Takım Lideri bilgileri güncellenirken bir hata oluştu');
                            }
                        })
                        .catch(error => {
                            console.error('Hata:', error.message);
                            // Hata durumunda gerekli işlemler yapılabilir (ör. hata mesajı gösterme)
                        });

                    break;
                case 'workers': 
                    const workerName = document.getElementById('name').value;
                    const workerUniversity = document.getElementById('university').value;
                    const workerPosition = document.getElementById('position').value;
                    const workerJob_start_date = document.getElementById('job_start_date').value;
                    const workerSchool_department = document.getElementById('school_department').value;
                    const workerParentCompany = document.getElementById('parentCompany').value;
                    const workerParentDepartment = document.getElementById('parentDepartment').value;
                    const workerBirth_of_day = document.getElementById('birth_of_day').value;
                    const workerHometown = document.getElementById('hometown').value;
                    const workerParentLead = document.getElementById('parentLead').value; // burada parent lead ID dönecek!
                        

                    const parentCompanySelect = document.getElementById('parentCompany');
                    const selectedCompanyOption = parentCompanySelect.options[parentCompanySelect.selectedIndex];
                    const workerParentCompanyText = selectedCompanyOption ? selectedCompanyOption.text : '';


                    const parentDepartmentSelect = document.getElementById('parentDepartment');
                    const selectedDepartmentOption = parentDepartmentSelect.options[parentDepartmentSelect.selectedIndex];
                    const workerParentDepartmentText = selectedDepartmentOption ? selectedDepartmentOption.text : '';

                    const parentLeadSelect = document.getElementById('parentLead');
                    const selectedLeadOption = parentLeadSelect.options[parentLeadSelect.selectedIndex];
                    const workerParentLeadtText = selectedLeadOption ? selectedLeadOption.text : '';

                  //5a3c5d9b-8890-47ba-92d1-6dcc9dc7898d, Logo Yazılım, Yazılım, Kaan Gencay  çıktısını veriyor alttaki kod unutma!
                    console.log(workerParentLead, workerParentCompanyText, workerParentDepartmentText, workerParentLeadtText, d.id);                    
                    // PUT isteği için kullanılacak veri objesi
                    const updatedDataWorker = {
                        name: workerName,
                        university: workerUniversity,
                        position: workerPosition,
                        job_start_date: workerJob_start_date,
                        school_department: workerSchool_department,
                        parentCompany: workerParentCompanyText,
                        parentDepartment: workerParentDepartmentText,
                        birth_of_day: workerBirth_of_day,
                        hometown: workerHometown,
                        parentLead: workerParentLeadtText
                    };
                    const requestOptionsWorker = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedDataWorker)
                    };

                    // fetch isteği gönder
                    fetch(`http://localhost:3000/worker/${d.id}`, requestOptionsWorker)
                        .then(response => {
                            if (response.ok) {
                                console.log(`${d.name} çalışan başarıyla güncellendi`);
                                editConfirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
                                location.reload();
                            } else {
                                throw new Error('Çalışan bilgileri güncellenirken bir hata oluştu');
                            }
                        })
                        .catch(error => {
                            console.error('Hata:', error.message);
                            // Hata durumunda gerekli işlemler yapılabilir (ör. hata mesajı gösterme)
                        });

                    // PUT isteği için kullanılacak veri objesi
                    const updatedLinkData = {
                        source: d.id,
                        target: workerParentLead
                    };

                    const requestOptionsLink = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedLinkData)
                    };
                    // fetch isteği gönder
                    fetch(`http://localhost:3000/links/${d.id}/${workerParentLead}`, requestOptionsLink)
                        .then(response => {
                            if (response.ok) {
                                console.log('Bağlantılar başarıyla güncellendi');
                            } else {
                                throw new Error('Bağlantılar güncellenirken bir hata oluştu');
                            }
                        })
                        .catch(error => {
                            console.error('Hata:', error.message);
                            // Hata durumunda gerekli işlemler yapılabilir (ör. hata mesajı gösterme)
                        });


                    break;

                default:
                    break;
            }
            console.log(`${d.name} güncellendi`);
            editConfirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
        };

        editCancelButtonID.onclick = function () {
            editConfirmationOverlay.style.display = 'none'; // Onay kutusunu gizle
        };
    }

}

);
function toggleFullscreen() {
    // Yeni sekme açma kodu buraya eklenecek
    window.open("organization_chart.html", "_blank");
}
