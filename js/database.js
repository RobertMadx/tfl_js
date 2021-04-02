var textFields = ['Number', 'FirstName', 'LastName', 'Model', 'Classes', 'Name']
window.onload = async function () {
    await initDb();
    registerEvents();
};

function registerEvents() {
    $(`#version`).html(version);
    $("#browse").click(function () {
        $("#fileUpload").click();
    });

    $('#download').on('click', function (e) {
        DownloadDatabase();
    });
    $('#convert').on('click', function (e) {
        convert();
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
        console.log(sheetName,json_object)
        if(json_object){

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
        }
        recreategroup()
    })
};

async function convert(){
    await db.remove({
        from: "Result2",
    });
    const Results = await db.select({
        from: "Result",
    });
    for (let n = 0; n < Results.length; n++) {
        
    
        let round = getround(Results[n].Race_id)
        const Results2 = await db.select({
            from: "Result2",
            where:{
                Entry_id:Results[n].Entry_id,
                Round_id:round
            }
        });
        let temp = Results[n].Race_id>3?Results[n].Race_id-3:Results[n].Race_id;
        if (Results2.length == 0){
            //insert
            await insertdb("Result2",{Entry_id:Results[n].Entry_id,Round_id:round,[`POS${temp}`]:Results[n].Position,[`PTS${temp}`]:Results[n].Points})
        } else {
            //update
            await db.update({
                in: "Result2", set: {[`POS${temp}`]:Results[n].Position,[`PTS${temp}`]:Results[n].Points}, where: { id: Results2[0].id }
            });
        }

    }
    console.log("Done");
}


function getround(race){
    switch (race) {
        case 1: return 1;
        case 2: return 1;
        case 3: return 1;
        case 4: return 2;
        case 5: return 2;
        case 6: return 2;
        case 7: return 3;
        case 8: return 3;
        case 9: return 3;
        case 10: return 4;
        case 11: return 4;
        case 12: return 4;
        case 13: return 5;
        case 14: return 5;
        case 15: return 5;
        case 16: return 6;
        case 17: return 6;
        case 18: return 6;
        case 19: return 7;
        case 20: return 7;
        case 21: return 7;
        case 22: return 8;
        case 23: return 8;
        case 24: return 8;
        default:return 0;
    }
}

function postopoints(pos){
    switch (pos) {
        case 1: return 25;
        case 2: return 22;
        case 3: return 20;
        case 4: return 18;
        case 5: return 16;
        case 6: return 15;
        case 7: return 14;
        case 8: return 13;
        case 9: return 12;
        case 10: return 11;
        case 11: return 10;
        case 12: return 9;
        case 13: return 8;
        case 14: return 7;
        case 15: return 6;
        case 16: return 5;
        case 17: return 4;
        case 18: return 3;
        case 19: return 2;
        case 20: return 1;
        default:return 0;
    }
}

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


async function recreategroup(){
    await db.remove({
        from: "Group",
    })
    const cls = await db.select({
        from: "Class",
    })
    let grpnum = [];
    let grpname = [];
    let grpids = [];
    for (let c = 0; c < cls.length; c++) {
        let index = grpnum.indexOf(cls[c].Group_id)
        if(index != -1){
            grpname[index] += `,${cls[c].Name}`
            grpids[index] += `,${cls[c].id}`
        } else {
            grpnum.push(cls[c].Group_id)
            grpname.push(`${cls[c].Name}`)
            grpids.push(`${cls[c].id}`)
        }
    }
    for (let g = 0; g < grpnum.length; g++) {
        await insertdb("Group",{
            Name: grpname[g],
            Classes: grpids[g],
            id:grpnum[g]
        })        
    }
}