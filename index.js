const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const pdf_parse = require("pdf-parse");
const pdf_dist = require("pdfjs-dist/legacy/build/pdf.js");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const ObjectId = require("mongodb").ObjectID;

const app = express();
const port = 3000;

var MongoClient = require("mongodb").MongoClient;
const res = require("express/lib/response");
const { ObjectID } = require("mongodb");
var url =
  "mongodb+srv://admin:a@muratkarakurt.9ergo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let db = 0,
  username_temp = "",
  id_temp = "",
  a = [],
  project_id,
  user_name;

app.use("/public", express.static("public/"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

app.get("/", async (req, res) => {
  res.render("choose");
});

app.get("/login_user", async (req, res) => {
  db = 0;
  let text = "";
  username_temp = "";
  id_temp = "";
  res.render("login", { text });
});

app.get("/login_admin", async (req, res) => {
  db = 1;
  let text = "";
  username_temp = "";
  id_temp = "";
  res.render("login", { text });
});

app.get("/admin_page", async (req, res) => {
  res.render("admin_page", {
    username: username_temp,
    id: id_temp,
  });
});

app.post("/analyse_file", (req, res) => {
  const path = "public/uploads";
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  let uploadedPDF = req.files.pdf;
  let PdfPath =
    "C:/Users/mrtkr/Desktop/Deneme" + "/public/uploads/" + uploadedPDF.name;
  uploadedPDF.mv(PdfPath);
  let jury_infos = [];
  extract_infos(uploadedPDF.name);
  setTimeout(() => {
    let inf = get_info_user();
    console.log("Yazar Bilgileri", inf);
    let lecture_name = get_lecture_name();
    console.log("Ders Adı", lecture_name[0]);
    console.log("Proje Başlığı ", lecture_name[1]);
    let date = get_lecture_date();
    console.log("Teslim Tarihi", date);
    let summary = get_sumamry_and_keys();
    console.log("Özet => ", summary[0]);
    console.log("Anahtar Kelimeler ", summary[1]);
    let members = get_members();
    console.log("Members ", members);
    if (uploadedPDF) {
      setTimeout(() => {
        //Datbase e kayıt işlemi id_temp ile kayıt yapabilrisin
        MongoClient.connect(url, (err, db) => {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = {
            userId: id_temp,
            name: lecture_name[0],
            title: lecture_name[1],
            date: date,
            summary: summary[0],
            keys: summary[1],
            path: PdfPath,
          };
          dbo.collection("project").insertOne(myobj, (err, res) => {
            if (err) throw err;
            project_id = res["insertedId"].toString();
            console.log(project_id);
            console.log("Project inserted.");
            db.close();
          });
        });
      }, 500);
      setTimeout(() => {
        MongoClient.connect(url, function (err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myquery = { username: username_temp };
          var newvalues = {
            $set: { name: inf[1], surname: inf[2], no: parseInt(inf[0]) },
          };
          dbo
            .collection("user")
            .updateOne(myquery, newvalues, function (err, res) {
              if (err) throw err;
              console.log("1 user updated");
              db.close();
            });
        });
      }, 500);
      setTimeout(() => {
        let consultant_info, consultant_name, consultant_degree;
        for (let i = 0; i < members.length; i++) {
          if (members[i][0].startsWith("Danışman")) {
            consultant_info = members[i];
            members.splice(i, 1);
          }
        }

        if (consultant_info.includes("Üyesi")) {
          consultant_name = consultant_info[1].split("Üyesi")[1];
          consultant_degree = consultant_info[1].split("Üyesi")[0];
        } else {
          consultant_name = consultant_info[1].split(". ")[1];
          consultant_degree = consultant_info[1].split(". ")[0];
        }

        let consultant_school = consultant_info[0].split(",")[1];

        MongoClient.connect(url, (err, db) => {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = {
            projectID: project_id,
            name: consultant_name,
            degree: consultant_degree,
            school: consultant_school,
          };
          dbo.collection("consultant").insertOne(myobj, (err, res) => {
            if (err) throw err;
            console.log("consultant inserted.");
            db.close();
          });
        });
      }, 750);
      setTimeout(() => {
        let jury_school, jury_name, jury_degree;
        for (let i = 0; i < members.length; i++) {
          jury_school = members[i][0].split(",")[1];
          if (members[i][1].includes("Üyesi")) {
            jury_name = members[i][1].split("Üyesi")[1];
            jury_degree = members[i][1].split("Üyesi")[0];
          } else {
            jury_name = members[i][1].split(". ")[1];
            jury_degree = members[i][1].split(". ")[0];
          }
          jury_infos.push([jury_name, jury_school, jury_degree]);
        }
      }, 750);

      setTimeout(() => {
        MongoClient.connect(url, (err, db) => {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = {
            projectID: project_id,
            name: jury_infos[0][0],
            degree: jury_infos[0][2],
            school: jury_infos[0][1],
          };
          dbo.collection("jury").insertOne(myobj, (err, res) => {
            if (err) throw err;
            console.log("jury inserted.");
            db.close();
          });
        });
        MongoClient.connect(url, (err, db) => {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myobj = {
            projectID: project_id,
            name: jury_infos[1][0],
            degree: jury_infos[1][2],
            school: jury_infos[1][1],
          };
          dbo.collection("jury").insertOne(myobj, (err, res) => {
            if (err) throw err;
            console.log("jury inserted.");
            db.close();
          });
        });
      }, 750);
    }
    console.log("Bitti");
    res.redirect("/user_page");
  });
});

app.get("/user_page", async (req, res) => {
  res.render("user_page", {
    username: user_name,
  });
});

app.post("/user_page", async (req, res) => {
  res.render("user_page", {
    username: user_name,
  });
});

app.post("/middleware", async (req, res) => {
  let text = "",
    username = req.body.username,
    password = req.body.password,
    user_info;
  db_nm = db == 1 ? "admin" : "user";
  if (username && password) {
    let promise = new Promise((resolve, reject) => {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo
          .collection(db_nm)
          .find({ username: username, password: password })
          .toArray(function (err, result) {
            if (err) throw err;
            db.close();
            if (result.length == 0) {
              reject();
            } else {
              username_temp = result[0]["username"];
              user_info = result[0];
              id = String(result[0]._id);
              id_temp = id;
              resolve("");
            }
          });
      });
    })
      .then(() => {
        user_name = user_info["username"];
        db == 1 ? res.redirect("/admin_page") : res.redirect("/user_page");
      })
      .catch(() => {
        text = "Wrong Attempt!";
        res.render("login", { text });
      });
  } else {
    text = "Information cannot be empty.";
    res.render("login", { text });
  }
});

app.get("/sorgu_1", (req, res) => {
  let search_result = {};
  res.render("sorgu1", {
    search_result,
  });
});
app.get("/sorgu_2", (req, res) => {
  let search_result = {};
  res.render("sorgu2", {
    search_result,
  });
});

app.get("/homeworks", (req, res) => {
  let search_result = [];

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { userId: id_temp };
    dbo
      .collection("project")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        search_result = result;
        db.close();
      });
  });

  setTimeout(() => {
    console.log(search_result);
    res.render("homeworks", {
      search_result,
    });
  }, 1000);
});

app.post("/search_project_sorgu_1", (req, res) => {
  let result_json = {};
  let search_result = [];
  let project_name = req.body.project_name;
  if (project_name != "") result_json["name"] = project_name;
  let lecture_name = req.body.lecture_name;
  if (lecture_name != "") result_json["title"] = lecture_name;
  let keys = req.body.keys;
  if (keys != "") result_json["keys"] = keys.toLowerCase();

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { userId: id_temp };
    dbo
      .collection("project")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        search_result = result;
        db.close();
      });
  });

  setTimeout(() => {
    let i = 0;
    if (keys != "") {
      console.log("Key Arıyo");
      while (i < search_result.length) {
        let key_array = keys.split(",");
        key_array.map((s) => s.trim());
        key_array.map((s) => s.toLowerCase());
        let temp = false;
        let input_keys = search_result[i].keys.split(",");
        input_keys.map((s) => s.trim());
        input_keys.map((s) => s.toLowerCase());
        for (let j = 0; j < input_keys.length; j++) {
          if (key_array.includes(input_keys[j].substring(1))) {
            temp = true;
          }
        }
        if (!temp) {
          search_result.splice(i, 1);
          i -= 1;
        }
        i++;
      }
    }
    i = 0;
    if (project_name != "") {
      console.log("Project name arıyo");
      while (i < search_result.length) {
        if (
          !search_result[i].name
            .toLowerCase()
            .includes(project_name.toLowerCase())
        ) {
          search_result.splice(i, 1);
          i -= 1;
        }
        i++;
      }
    }
    i = 0;
    if (lecture_name != "") {
      console.log("Lecture name arıyo");
      while (i < search_result.length) {
        if (
          !search_result[i].title
            .toLowerCase()
            .includes(lecture_name.toLowerCase())
        ) {
          search_result.splice(i, 1);
          i -= 1;
        }
        i++;
      }
    }
    res.render("sorgu1", {
      search_result,
    });
  }, 2000);
});

app.post("/search_project_sorgu_2", (req, res) => {
  let search_result = [];
  let season = req.body.season;
  let month = season.split(" ")[1],
    year = season.split(" ")[0];

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { userId: id_temp };
    dbo
      .collection("project")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        search_result = result;
        db.close();
      });
  });
  setTimeout(() => {
    console.log("b", search_result);
    let i = 0;
    if (season != "") {
      while (i < search_result.length) {
        console.log("Döndü");
        let temp_year = search_result[i].date.split(" ")[0],
          temp_season = search_result[i].date.split(" ")[1];
        if (
          temp_year == year &&
          temp_season.toLowerCase().trim() == month.toLowerCase().trim()
        ) {
        } else {
          console.log(i, " SİLDİ");
          search_result.splice(i, 1);
          i -= 1;
        }
        i++;
      }
    }
    console.log("2.Sorug sonucu " , search_result)
    res.render("sorgu2", {
      search_result,
    });
  }, 2000);
});

app.post("/add_user", (req, res) => {
  let temp_username = req.body.username;
  let temp_pass = req.body.password;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myobj = { username: temp_username, password: temp_pass };
    dbo.collection("user").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
  setTimeout(() => {
    res.render("admin_page", {
      username: username_temp,
      id: id_temp,
    });
  }, 500);
});

app.get("/admin_user_delete", (req, res) => {
  res.render("admin_user_delete", {
    username: username_temp,
    id: id_temp,
  });
});

app.get("/admin_user_update", (req, res) => {
  res.render("admin_user_update", {
    username: username_temp,
    id: id_temp,
  });
});

app.get("/admin_sorgu_1", (req, res) => {
  let search_result = {};
  res.render("admin_sorgu_1", {
    username: username_temp,
    id: id_temp,
    search_result,
  });
});

app.post("/admin_search_sorgu_1", (req, res) => {
  let result_json = {};
  let search_result = [],
    user_result = [];
  let input_username = req.body.input_username,
    user_find = false;
  if (input_username != "") result_json["username"] = input_username;
  let user_temp_id;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { username: input_username };
    dbo
      .collection("user")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          console.log("Sonuç Var!!");
          user_find = true;
          user_temp_id = result[0]._id + "";
        }
        db.close();
      });
  });

  setTimeout(() => {
    if (!user_find) {
      console.log("Boş Dönüş yapıyo");
      res.render("admin_sorgu_1", {
        username: username_temp,
        id: id_temp,
        search_result,
      });
    } else {
      let project_name = req.body.project_name;
      if (project_name != "") result_json["name"] = project_name;
      let lecture_name = req.body.lecture_name;
      if (lecture_name != "") result_json["title"] = lecture_name;
      let keys = req.body.keys;
      if (keys != "") result_json["keys"] = keys.toLowerCase();

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = { userId: user_temp_id };
        dbo
          .collection("project")
          .find(query)
          .toArray(function (err, result) {
            if (err) throw err;
            if (search_result.length > 0) console.log("Proje Sonucu Var");
            search_result = result;
            db.close();
          });
      });

      setTimeout(() => {
        let i = 0;
        if (keys != "") {
          while (i < search_result.length) {
            let key_array = keys.split(",");
            key_array.map((s) => s.trim());
            key_array.map((s) => s.toLowerCase());
            let temp = false;
            let input_keys = search_result[i].keys.split(",");
            input_keys.map((s) => s.trim());
            input_keys.map((s) => s.toLowerCase());
            for (let j = 0; j < input_keys.length; j++) {
              if (key_array.includes(input_keys[j].substring(1))) {
                temp = true;
              }
            }
            if (!temp) {
              search_result.splice(i, 1);
              i -= 1;
            }
            i++;
          }
        }
        i = 0;
        if (project_name != "") {
          while (i < search_result.length) {
            if (
              !search_result[i].name
                .toLowerCase()
                .includes(project_name.toLowerCase())
            ) {
              search_result.splice(i, 1);
              i -= 1;
            }
            i++;
          }
        }
        i = 0;
        if (lecture_name != "") {
          while (i < search_result.length) {
            if (
              !search_result[i].title
                .toLowerCase()
                .includes(lecture_name.toLowerCase())
            ) {
              search_result.splice(i, 1);
              i -= 1;
            }
            i++;
          }
        }
        res.render("admin_sorgu_1", {
          username: username_temp,
          id: id_temp,
          search_result,
        });
      }, 1000);
    }
  }, 5000);
});

app.get("/admin_sorgu_2", (req, res) => {
  let search_result = {};
  res.render("admin_sorgu_2", {
    username: username_temp,
    id: id_temp,
    search_result,
  });
});

app.post("/admin_search_sorgu_2", (req, res) => {
  let search_result = [];
  let season = req.body.season,
    input_username = req.body.input_username,
    user_find = false,
    user_temp_id,
    month = "",
    year = "";
  if (season != "") {
    month = season.split(" ")[1];
    year = season.split(" ")[0];
  }

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { username: input_username };
    dbo
      .collection("user")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          console.log("Kullanıcı Buldı");
          user_find = true;
          user_temp_id = result[0]._id + "";
        }
        db.close();
      });
  });

  setTimeout(() => {
    if (!user_find) {
      console.log("Kullanıcı İsmi BOş");
      res.render("admin_sorgu_2", {
        username: username_temp,
        id: id_temp,
        search_result,
      });
    } else {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var query = { userId: user_temp_id };
        dbo
          .collection("project")
          .find(query)
          .toArray(function (err, result) {
            if (err) throw err;
            search_result = result;
            db.close();
          });
      });
      setTimeout(() => {
        let i = 0;
        if (season != "") {
          while (i < search_result.length) {
            let temp_year = search_result[i].date.split(" ")[0],
              temp_season = search_result[i].date.split(" ")[1];
            if (
              temp_year == year &&
              temp_season.toLowerCase().trim() == month.toLowerCase().trim()
            ) {
            } else {
              search_result.splice(i, 1);
              i -= 1;
            }
            i++;
          }
        }
        res.render("admin_sorgu_2", {
          username: username_temp,
          id: id_temp,
          search_result,
        });
      }, 1000);
    }
  }, 3000);
});

app.post("/project", (req, res) => {
  let search_result = [];
  var project_id = Object.keys(req.body)[0];
  console.log(project_id);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { _id: new ObjectID(project_id) };
    dbo
      .collection("project")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        if (result.length > 0) console.log(result[0].path);
        search_result = result;
        db.close();
      });
  });
  setTimeout(() => {
    let new_path = "/";
    if (search_result[0].path) {
      for (let k = 5; k < search_result[0].path.split("/").length; k++) {
        new_path += search_result[0].path.split("/")[k];
        if(k != search_result[0].path.split("/").length - 1) new_path += "/"
      }
    }
    //console.log(search_result)
    res.render("project", {
      search_result,
      new_path,
    });
  }, 2000);
});

app.listen(port);

function extract_infos(path) {
  let b;
  let promise = new Promise((resolve, reject) => {
    let sj = "C:\\Users\\mrtkr\\Desktop\\Deneme\\public\\uploads\\" + path;
    let dataBuffer = fs.readFileSync(sj);
    let options = {
      max: 10,
    };
    pdf_parse(dataBuffer, options).then(function (data) {
      b = data.text.split("\n");
      resolve();
    });
  })
    .then(() => {
      for (let i = 0; i < b.length; i++) {
        let temp = b[i].trim();
        b[i] = temp;
      }
      b = b.filter((e) => e);
      a = b;
    })
    .catch(() => {
      console.log("Pdf Okunurken Hata !!!");
    });
}

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
      ? String(parseInt(year) - 1 + "-" + parseInt(year))
      : String(parseInt(year) + "-" + (parseInt(year) + 1));
  let season = parseInt(month) < 7 ? "BAHAR DÖNEMİ" : "GÜZ DÖNEMİ";
  temp = year + " " + season;
  return temp;
}

function get_sumamry_and_keys() {
  let temp,
    count = 0,
    summary = "",
    keys;
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.startsWith("ÖZET")) {
      count++;
      if (count == 2) {
        let temp_index = index + 1;
        for (let j = index; j < a.length; j++) {
          const t = a[j];
          if (t.startsWith("Anahtar")) {
            keys = t.split(":")[1];
            break;
          }
          summary += t;
        }
        break;
      }
    }
  }
  return [summary, keys.toLowerCase()];
}

function get_members() {
  let result = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.startsWith("Tezin Sav")) {
      let temp = [];
      for (let i = index - 1; i > index - 10; i--) {
        if (i == index - 9) {
          temp.push(a[i]);
          result.push(temp);
          temp = [];
        }
        if (a[i].startsWith(".")) {
          result.push(temp);
          temp = [];
        } else {
          temp.push(a[i]);
        }
      }
    }
  }
  result.shift();
  return result;
}
