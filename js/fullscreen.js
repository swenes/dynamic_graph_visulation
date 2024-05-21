let popup2; // popup2 değişkenini global olarak tanımlıyoruz

// JSON dosyasını yükleme
Promise.all([
    fetch('http://localhost:3000/nodes').then(response => response.json()),
    fetch('http://localhost:3000/links').then(response => response.json())
]).then(([nodesData, linksData]) => {
    // SVG genişlik ve yükseklik ayarları
    const width = 1895;
    const height = 890;

    const colorScale = d3.scaleOrdinal()
        .domain(["head", "company", "department", "workers", "teamLeads"])
        .range(["red", "blue", "green", "orange", "purple"]);

    const sizeScale = d3.scaleOrdinal()
    .domain(["head", "company", "department", "workers", "teamLeads"])
    .range([120, 100, 80, 60, 70]);

    // SVG containerını seçme
    const svgContainer = d3.select("#organizationChart2")
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
        .on("click", toggleDetails)
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
           else if (d.type == "department") {
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
      .text(function(d) {
          if (d.type === "company" || d.type == "head") {
              return d.name + "\nCEO: " + d.ceo + "\nCTO: " + d.cto + "\nKuruluş Tarihi: " + d.kurulusTarihi ;
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
        "Satın Alma": "purple",
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
    function toggleDetails(event, d) {
        if (!popup2 || popup2.datum() !== d) {
            if (popup2) {
                popup2.remove(); // Eğer farklı bir düğme tıklanmışsa, popup2'ı kapat
                popup2 = null; // Popup2 değişkenini sıfırla
            }
            createPopup(d); // Yeni düğüm için popup oluştur
        } else {
            popup2.remove(); // Eğer aynı düğme tıklanırsa, popup2'ı kapat
            popup2 = null; // Popup2 değişkenini sıfırla
        }
    }
    
    
        // Yeni bir popup oluşturma işlevi
        function createPopup(d) {
            // Popup penceresini oluştur
            popup2 = d3.select("body")
                .append("div")
                .attr("class", "popup2");
        
            // Popup2 içeriğini oluştur
            let form;
            if (d.type === "workers") {
                form = `
                <h2>Çalışan Detayları</h2>
                <img src="${d.profile_picture}" alt="Profil Resmi">
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
                <img src="${d.profile_picture}" alt="Profil Resmi">
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
                <img src="${d.logo}" alt="Profil Resmi" style="height:75px; width:80px;">
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
                <h2>Koç Holding Hakkında</h2>
                <p><strong>Şirket Adı:</strong> ${d.name}</p>
                <p><strong>Kuruluş Tarihi:</strong> ${d.kurulusTarihi}</p>
                <p><strong>CEO:</strong> ${d.ceo}</p>
                <p><strong>CTO:</strong> ${d.cto}</p>
                <p><strong>Vizyon</strong><br>${vizyonSatirlar.join("<br>")}</p>
                <p><strong>Misyon</strong><br>${misyonSatirlar.join("<br>")}</p>
                <p><strong>Çalışan Sayısı:</strong> ${d.calisanSayisi}</p>
                `;
            }
        
            // Popup2 içeriğini ekle
            popup2.html(form);
        
            // Popup2 penceresini kapatmak için tıklama olayını dinle
            popup2.on("click", function () {
                popup2.remove(); // Popup2 penceresini kapat
                popup2 = null; // Popup2 değişkenini sıfırla
            });
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

});


