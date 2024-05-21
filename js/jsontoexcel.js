function downloadExcel() {
  // Verilerin alınacağı URL'ler
  const nodesUrl = 'http://localhost:3000/nodes';
  const linksUrl = 'http://localhost:3000/links';

  // Verileri almak için fetch kullanımı
  Promise.all([
    fetch(nodesUrl).then(response => response.json()),
    fetch(linksUrl).then(response => response.json())
  ])
    .then(([nodesData, linksData]) => {
      // Excel için başlık satırını oluşturma
      const excelData = [
        ["id", "name", "type", "parentCompany", "parentDepartment", "isTeamLead", "parentLead", "sicil", "birth_of_day", "university", "school_department", "job_start_date", "position", "sex", "hometown", "profile_picture"]
      ];

      // Her bir veri türü için verileri excelData'ya eklemek
      ["workers", "teamLeads"].forEach(type => {
        if (Array.isArray(nodesData.types.employee[type])) {
          nodesData.types.employee[type].forEach(item => {
            const rowData = [
              item.id || "", // id
              item.name || "", // name
              type === "workers" ? "worker" : "Team Lead", // type
              item.parentCompany || "",
              item.parentDepartment || "",
              type === "teamLeads" ? "true" : "false", // isTeamLead
              item.parentLead || "",
              item.sicil || "",
              item.birth_of_day || "",
              item.university || "",
              item.school_department || "",
              item.job_start_date || "",
              item.position || "",
              item.sex || "",
              item.hometown || "",
              item.profile_picture || "",
            ];
            excelData.push(rowData);
          });
        }
      });

      // Excel dosyası oluşturma adımları
      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.aoa_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws1, "Workers & Team Leads");

      // Head, company ve department verileri için yeni bir sayfa (sheet) oluşturma
      const headCompanyDeptData = [
        ["id", "name", "type", "parentCompany", "logo", "kurulusTarihi", "ceo", "cto", "vizyon", "misyon", "calisanSayisi"]
      ];

      ["head", "company", "department"].forEach(type => {
        if (Array.isArray(nodesData.types[type])) {
          nodesData.types[type].forEach(item => {
            const rowData = [
              item.id || "",
              item.name || "",
              item.type || "",
              type === "department" ? item.parentCompany || "" : "", // parentCompany
              item.logo || "",
              item.kurulusTarihi || "",
              item.ceo || "",
              item.cto || "",
              item.vizyon || "",
              item.misyon || "",
              item.calisanSayisi || ""
            ];
            headCompanyDeptData.push(rowData);
          });
        }
      });

      const ws2 = XLSX.utils.aoa_to_sheet(headCompanyDeptData);
      XLSX.utils.book_append_sheet(wb, ws2, "Head, Company & Department");

      // Links verilerini 3. sayfaya (sheet) ekleyelim
      const linksDataArr = [
        ["Source Node ID", "Target Node ID", "Description"]
      ];

      if (Array.isArray(linksData)) {
        linksData.forEach(link => {
          const linkRow = [
            link.source || "",
            link.target || "",
            link.description || ""
          ];
          linksDataArr.push(linkRow);
        });
      }

      const ws3 = XLSX.utils.aoa_to_sheet(linksDataArr);
      XLSX.utils.book_append_sheet(wb, ws3, "Links");

      // Excel dosyasını oluştur ve indirme işlemi
      const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const fileName = "logo_employee_informations.xlsx";
      const blob = new Blob([wbout], {type:"application/octet-stream"});
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    })
    .catch(error => {
      console.error('Veri alınamadı:', error);
    });
}
