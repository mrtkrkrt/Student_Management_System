const pdf = require("pdf-parse");
const fs = require("fs");

let a = [];
function deneme() {
  let b;
  let promise = new Promise((resolve, reject) => {
    let dataBuffer = fs.readFileSync("C:\\Users\\mrtkr\\Desktop\\Deneme\\public\\uploads\\Murat_Karakurt_Tez.pdf");
    let options = {
      max: 10,
    };
    pdf(dataBuffer, options).then(function (data) {
      b = data.text.split("\n");
      resolve();
    });
  })
    .then(() => {
      console.log("Girdi")
      for (let i = 0; i < b.length; i++) {
        let temp = b[i].trim();
        b[i] = temp;
      }
      b = b.filter((e) => e);
      //console.log(b)
      a = b;
    })
    .catch(() => {
      console.log("Pdf Okunurken Hata !!!");
    });
}

deneme();

function get_info_user() {
  let no, name, surname;
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.startsWith("Öğrenc")) {
      no = element.split(":")[1];
      name = a[index + 1].split(":")[1].split(" ")[0];
      surname = a[index + 1].split(":")[1].split(" ")[1];
      break;
    }
  }
  return [no, name, surname];
}

function get_lecture_name() {
  let temp,
    count = 0,
    title;
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.split(" ").length == 3) {
      count++;
      if (element.split(" ")[2].match("BÖLÜMÜ") && count == 2) {
        temp = a[index + 1];
        title = a[index + 2];
        break;
      }
    }
  }
  return [temp, title];
}

function get_lecture_date() {
  let temp;
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.startsWith("Tezin Sav")) temp = element.split(":")[1];
  }
  let [day, month, year] = temp.split(".");
  year =
    parseInt(day) < 7
      ? String(parseInt(year) - 1 + "/" + parseInt(year))
      : String(parseInt(year) + "/" + (parseInt(year) + 1));
  let season = parseInt(day) < 7 ? "BAHAR DÖNEMİ" : "GÜZ DÖNEMİ";
  temp = year + " " + season;
  return temp;
}

function get_sumamry_and_keys() {
  let temp,
    count = 0, summary = "", keys;
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.startsWith("ÖZET")) {
      count++;
      if (count == 2) {
        let temp_index = index + 1;
        for (let j = index; j < a.length; j++) {
          const t = a[j];
          if(t.startsWith("Anahtar")){
            keys = t.split(":")[1]
            break
          }
          summary += t
        }
        break;
      }
    }
  }
  return [summary, keys]
}

function get_members(){
  let result = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.startsWith("Tezin Sav")){
      let temp = []
      for(let i = index - 1; i > index - 10 ; i--){
        if(i == index - 9) {
          temp.push(a[i])
          result.push(temp)
          temp = []
        }
        if(a[i].startsWith(".")){
          result.push(temp)
          temp = []
        }else{
          temp.push(a[i])
        }
      }
    }
  }
  result.shift()
  return result
}

setTimeout(() => {
  let inf = get_info_user();
  console.log("Yazar Bilgileri", inf);
  let lecture_name = get_lecture_name();
  console.log("Ders Adı", lecture_name[0]);
  console.log("Proje Başlığı ", lecture_name[1]);
  let date = get_lecture_date();
  console.log("Teslim Tarihi", date);
  let summary = get_sumamry_and_keys();
  console.log("Özet => ", summary[0])
  console.log("ANahtar Kelimeler ", summary[1])
  let members = get_members()
  console.log("Members ", members)
 /*  for(let i = 11; i < 25; i++){
    console.log(a[i])
  } */
}, 1000);








































/* function pdf_parser() {
  return new Promise((resolve, reject) => {
    let dataBuffer = fs.readFileSync("public/uploads/Murat_Karakurt_Tez.pdf");

    let options = {
      max: 4,
    };
    pdf(dataBuffer, options).then(function (data) {
      a = data.text.split("\n");
    });
    console.log("Okudu")
    resolve();  
  })
}

function dfkl() {
  console.log("DFKLADLKAŞİLDLSKŞİLSD")
  for (let i = 0; i < a.length; i++) {
    let temp = a[i].trim();
    a[i] = temp;
  }
  let a = a.filter((e) => e);
  console.log("Değiştirdii")
  console.log(a)
}

pdf_parser().then(dfkl()) */

/* function create_a(){
    let dataBuffer = fs.readFileSync("public/uploads/Murat_Karakurt_Tez.pdf");

    let options = {
      max: 4,
    };
    pdf(dataBuffer, options).then(function (data) {
      a = data.text.split("\n");
      console.log("Callback başladı")
      for (let i = 0; i < a.length; i++) {
        let temp = a[i].trim();
        a[i] = temp;
      }
      let a = a.filter((e) => e);
    });
    console.log(a)
}
create_a() */
