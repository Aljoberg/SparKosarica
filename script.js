let _$ = jQuery.noConflict();
chrome.storage.local.get(["shop"], r => {
  if(!r["shop"]) {
    _$("#container").append("<h1>Nič izdelkov (zaenkrat). Pojdi kaj kupit! ;)</h1>")
    return;
  }
  r["shop"].reverse().forEach(element => {
      if(element["items"]) {
          const formattedDate = formatDate(element["date"]);
          const container = _$("#container");
          container.append(`<h3>Košarica dneva ${formattedDate}</h3>`);
          element["items"].forEach(item => {
              container.append(`<p>${item["name"]}</p>`);
              container.children().last().on("click", function() {
                  !_$(this).css("textDecoration").startsWith("line-through") && chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                      if(!tabs[0].url.startsWith("https://www.spar.si/online")) return alert("Nisi na spar.si/online strani. (Zato extension ne dela.)");
                      chrome.scripting.executeScript({
                          target: {tabId: tabs[0].id},
                          files: ["jquery.js"] // For some unknown reason, ONLY jquery's ajax works. no fetch, no xhr. i have NO IDEA WHY.
                      }, () => {
                          chrome.scripting.executeScript({
                              target: {tabId: tabs[0].id},
                              args: [item],
                              func: item => new Promise((res, rej) => $.ajax({
                                  url: "/online/cart/add/",
                                  data: `productCodePost=${item["id"]}&currentURL=${location.href}&CSRFToken=${$("input[name='CSRFToken']")[0].value}`,
                                  cache: false,
                                  type: "POST", 
                                  success: res,
                                  error: rej
                              }))
                          }, result => {
                              let resu = result[0].result;
                              if(resu.status == "true") {
                                  alert("Dodan v košarico!");
                                  _$(this).css("textDecoration", "line-through");
                              } else {
                                  alert(`Error (vec v konzoli):\n${resu.errorMsg ?? JSON.stringify(resu)}`);
                                  console.log(resu);
                              }
                          });
                      });
                  });
              });
          });
      }
  });
});

function formatDate(rawDate) {
  const d = new Date(rawDate);
  const weekdays = ["Ponedeljek","Torek","Sreda","Četrtek","Petek","Sobota","Nedelja"];
  const months = ["Januar","Februar","Marec","April","Maj","Junij","Julij","Avgust","September","Oktober","November","December"];
  return `${weekdays[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}