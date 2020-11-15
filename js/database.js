var textFields = ['Number', 'FirstName', 'LastName', 'Model', 'Classes', 'Name']
window.onload = function () {
    initDb();
    registerEvents();
};

function registerEvents() {
    $("#browse").click(function () {
        $("#fileUpload").click();
    });

    $('#download').on('click', function (e) {
        DownloadDatabase();
    });
}

async function ProcessExcel(data) {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    $("#bars").html("");
    workbook.SheetNames.forEach(async function (sheetName) {
        $("#bars").append(progressbar(sheetName));
    })
    workbook.SheetNames.forEach(async function (sheetName) {

        // Here is your object
        var json_object = await XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });


        await db.remove({
            from: sheetName,
        });
        if (json_object.length < 1) {
            $(`#${sheetName}_bar`).remove()
        }

        for (let i = 1; i <= json_object.length; i++) {
            let per = Math.round((i / json_object.length) * 100);

            $(`#${sheetName}`).css('width', `${per}%`)
            $(`#${sheetName}`).html(`${per}%`)

            if (per == 100) {
                $(`#${sheetName}_bar`).remove()
            }

            let entry = {};
            if (typeof json_object[i] != 'undefined') {

                for (let j = 0; j < json_object[i].length; j++) {
                    let key = json_object[0][j];
                    let value = json_object[i][j];

                    if (textFields.includes(key)) {
                        value = json_object[i][j].replace('"', "").replace('"', "");
                    } else {
                        value = json_object[i][j];
                    }
                    Object.assign(entry, { [key]: value })
                }
                await insertdb(sheetName, entry)
            }
        }
    })
};

async function ProcessExcel(data) {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    $("#bars").html("");
    workbook.SheetNames.forEach(async function (sheetName) {
        $("#bars").append(progressbar(sheetName));
    })
    workbook.SheetNames.forEach(async function (sheetName) {

        // Here is your object
        var json_object = await XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });


        await db.remove({
            from: sheetName,
        });
        if (json_object.length < 1) {
            $(`#${sheetName}_bar`).remove()
        }

        for (let i = 1; i <= json_object.length; i++) {
            let per = Math.round((i / json_object.length) * 100);

            $(`#${sheetName}`).css('width', `${per}%`)
            $(`#${sheetName}`).html(`${per}%`)

            if (per == 100) {
                $(`#${sheetName}_bar`).remove()
            }

            let entry = {};
            if (typeof json_object[i] != 'undefined') {

                for (let j = 0; j < json_object[i].length; j++) {
                    let key = json_object[0][j];
                    let value = json_object[i][j];

                    if (textFields.includes(key)) {
                        value = json_object[i][j].replace('"', "").replace('"', "");
                    } else {
                        value = json_object[i][j];
                    }
                    Object.assign(entry, { [key]: value })
                }
                await insertdb(sheetName, entry)
            }
        }
    })
};

function Upload() {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");

    //Validate whether File is valid Excel file.
    if (typeof (FileReader) != "undefined") {
        var reader = new FileReader();

        //For Browsers other than IE.
        if (reader.readAsBinaryString) {
            reader.onload = function (e) {
                ProcessExcel(e.target.result);
            };
            reader.readAsBinaryString(fileUpload.files[0]);
        } else {
            //For IE Browser.
            reader.onload = function (e) {
                var data = "";
                var bytes = new Uint8Array(e.target.result);
                for (var i = 0; i < bytes.byteLength; i++) {
                    data += String.fromCharCode(bytes[i]);
                }
                ProcessExcel(data);
            };
            reader.readAsArrayBuffer(fileUpload.files[0]);
        }
    } else {
        alert("This browser does not support HTML5.");
    }
}

async function DownloadDatabase() {
    const dbschema = await db.getDbSchema("TheFinishLine");
    var wb = XLSX.utils.book_new();

    for (const table of dbschema.tables) {
        const temp_raw = await getTable(table.name);
        let temp_json = [];
        temp_raw.forEach(function (r) {
            textFields.forEach(element => {
                if (element in r) r[element] = `"${r[element]}"`
            });
            temp_json.push(r);
        })
        let temp = XLSX.utils.json_to_sheet(temp_json)
        XLSX.utils.book_append_sheet(wb, temp, table.name)
    }
    XLSX.writeFile(wb, 'database.xlsx') // name of the file is 'book.xlsx'
}


