const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const pdf_parse = require('pdf-parse');
const pdf_dist = require('pdfjs-dist/legacy/build/pdf.js');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

var MongoClient = require('mongodb').MongoClient;
var url =
    'mongodb+srv://admin:a@muratkarakurt.9ergo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
let db = 0,
    username_temp = '',
    id_temp = '',
    a = [];

app.use('/public', express.static('public/'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

app.get('/', async (req, res) => {
    res.render('choose');
});

app.get('/login_user', async (req, res) => {
    db = 0;
    let text = '';
    res.render('login', { text });
});

app.get('/login_admin', async (req, res) => {
    db = 1;
    let text = '';
    username_temp = '';
    id_temp = '';
    res.render('login', { text });
});

app.get('/admin_page/:id', async (req, res) => {
    let username = req.query.username,
        id = String(req.url).split('/')[1];
    res.render('admin_page', {
        username: username,
        id: id,
    });
});

app.post('/analyse_file', (req, res) => {
    const path = 'public/uploads';
    if (!fs.existsSync(path)) fs.mkdirSync(path);
    let uploadedPDF = req.files.pdf;
    let PdfPath =
        'C:/Users/mrtkr/Desktop/Deneme' + '/public/uploads/' + uploadedPDF.name;
    uploadedPDF.mv(PdfPath);
    deneme(uploadedPDF.name);
    setTimeout(() => {
        let inf = get_info_user();
        console.log('Yazar Bilgileri', inf);
        let lecture_name = get_lecture_name();
        console.log('Ders Adı', lecture_name[0]);
        console.log('Proje Başlığı ', lecture_name[1]);
        let date = get_lecture_date();
        console.log('Teslim Tarihi', date);
        let summary = get_sumamry_and_keys();
        console.log('Özet => ', summary[0]);
        console.log('ANahtar Kelimeler ', summary[1]);
        let members = get_members();
        console.log('Members ', members);

    }, 1000);
    res.redirect('/user_page/' + id_temp + '/?username=' + username_temp);
});

app.get('/user_page/:id', async (req, res) => {
    let username = req.query.username,
        id = String(req.url).split('/')[1];
    res.render('user_page', {
        username: username,
        id: id,
    });
});

app.post('/middleware', async (req, res) => {
    let text = '',
        username = req.body.username,
        password = req.body.password,
        user_info;
    db_nm = db == 1 ? 'admin' : 'user';
    if (username && password) {
        let promise = new Promise((resolve, reject) => {
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db('mydb');
                dbo.collection(db_nm)
                    .find({ username: username, password: password })
                    .toArray(function (err, result) {
                        if (err) throw err;
                        db.close();
                        if (result.length == 0) {
                            reject();
                        } else {
                            username_temp = result[0]['username'];
                            user_info = result[0];
                            id = String(result[0]._id);
                            id_temp = id;
                            resolve('');
                        }
                    });
            });
        })
            .then(() => {
                db == 1
                    ? res.redirect(
                          '/admin_page/' +
                              id +
                              '/?username=' +
                              user_info['username']
                      )
                    : res.redirect(
                          '/user_page/' +
                              id +
                              '/?username=' +
                              user_info['username']
                      );
            })
            .catch(() => {
                text = 'Wrong Attempt!';
                res.render('login', { text });
            });
    } else {
        text = 'Information cannot be empty.';
        res.render('login', { text });
    }
});

app.listen(port);

function deneme(path) {
    let b;
    let promise = new Promise((resolve, reject) => {
        let dataBuffer = fs.readFileSync(
            'C:\\Users\\mrtkr\\Desktop\\Deneme\\public\\uploads\\' + path
        );
        let options = {
            max: 10,
        };
        pdf_parse(dataBuffer, options).then(function (data) {
            b = data.text.split('\n');
            resolve();
        });
    })
        .then(() => {
            for (let i = 0; i < b.length; i++) {
                let temp = b[i].trim();
                b[i] = temp;
            }
            b = b.filter((e) => e);
            //console.log(b)
            a = b;
        })
        .catch(() => {
            console.log('Pdf Okunurken Hata !!!');
        });
}

function get_info_user() {
    let no, name, surname;
    for (let index = 0; index < a.length; index++) {
        const element = a[index];
        if (element.startsWith('Öğrenc')) {
            no = element.split(':')[1];
            name = a[index + 1].split(':')[1].split(' ')[0];
            surname = a[index + 1].split(':')[1].split(' ')[1];
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
        if (element.split(' ').length == 3) {
            count++;
            if (element.split(' ')[2].match('BÖLÜMÜ') && count == 2) {
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
        if (element.startsWith('Tezin Sav')) temp = element.split(':')[1];
    }
    let [day, month, year] = temp.split('.');
    year =
        parseInt(day) < 7
            ? String(parseInt(year) - 1 + '/' + parseInt(year))
            : String(parseInt(year) + '/' + (parseInt(year) + 1));
    let season = parseInt(day) < 7 ? 'BAHAR DÖNEMİ' : 'GÜZ DÖNEMİ';
    temp = year + ' ' + season;
    return temp;
}

function get_sumamry_and_keys() {
    let temp,
        count = 0,
        summary = '',
        keys;
    for (let index = 0; index < a.length; index++) {
        const element = a[index];
        if (element.startsWith('ÖZET')) {
            count++;
            if (count == 2) {
                let temp_index = index + 1;
                for (let j = index; j < a.length; j++) {
                    const t = a[j];
                    if (t.startsWith('Anahtar')) {
                        keys = t.split(':')[1];
                        break;
                    }
                    summary += t;
                }
                break;
            }
        }
    }
    return [summary, keys];
}

function get_members() {
    let result = [];
    for (let index = 0; index < a.length; index++) {
        const element = a[index];
        if (element.startsWith('Tezin Sav')) {
            let temp = [];
            for (let i = index - 1; i > index - 10; i--) {
                if (i == index - 9) {
                    temp.push(a[i]);
                    result.push(temp);
                    temp = [];
                }
                if (a[i].startsWith('.')) {
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
