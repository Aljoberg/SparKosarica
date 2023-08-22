if(location.href == "https://www.spar.si/online/checkout") {
      let rg = /spardtm\.cart\.id\s*=\s*["'](\w+)["'];/g;
      let email = document.querySelector("div[data-user]");
    fetch(`https://www.spar.si/online/sparcommercewebservices/v2/spar.si/users/${email.getAttribute("data-user")}/carts/${spardtm.innerHTML.match(rg)[0].split("\"")[1].split("\"")[0]}?fields=FULL`, {headers: {'authorization': `Bearer ${email.getAttribute("data-user-token")}`}}).then(async resp => {
    let e = await resp.json();
    let arr = [];
    e["entries"].forEach(element => arr.push({name: element["product"]["name"], id: element["product"]["code"]}));
    chrome.storage.local.get(["shop"], r => {
      r = r["shop"];
      r.push({items: arr, date: Date.now()});
      chrome.storage.local.set({"shop": r});
    })
  });
}
