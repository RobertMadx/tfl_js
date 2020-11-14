var textFields = ['Number', 'FirstName', 'LastName', 'Model', 'Classes', 'Name']
var db = new JsStore.Connection(new Worker("./js/jsstore.worker.min.js"));

async function loadAllSelect() {
    await loadSelect("Season");
    await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
    await loadSelect("Race", "Round", parseInt(localStorage.getItem("Round")));
    await loadSelect("Group");
}

async function initDb() {
    var isDbCreated = await db.initDb(getDbSchema());
    if (isDbCreated) {
        //console.log('db created');
        initTables(db);
    }
    else {
        //console.log('db opened');
    }
}



async function insertdb(table, values) {
    await db.insert({
        into: table,
        values: [values]
    });
}

function resultrow(name, id, color) {
    let btn = btncolor(color);
    return `
    <div class="row border-bottom p-1">
        <div>
            <button data-toggle="tooltip" class='btn ${btn} lap p-1'>${name}</button>
        </div>
        <div id="${id}" class="col">

        </div>
    </div>`;
}

function btncolor(color) {
    switch (color) {
        case 0: return `btn-outline-success`
        case 1: return `btn-outline-primary`;
        case 2: return `btn-outline-danger`;
        case 3: return `btn-outline-warning`;
        case 4: return `btn-outline-secondary`;
        case 5: return `btn-outline-dark`;
        default: return `btn-outline-dark`;
    }
}


function racebtn(Num, id = "", active = "", color, Name = "Unknown", Bike = "Unknown") {
    let btn = btncolor(color);
    return `<button id="${id}" data-toggle="tooltip" data-placement="bottom" data-html="true"
    title="<span>Name: ${Name}</span><br>
    <span>Bike: ${Bike}</span>"
    class='btn ${btn} entry p-1 ${active}'>${Num}</button>`;
}
function racebtngrp(Num, color = 1, id = "", pos = "", Name = "Name", Bike = "Bike", laps = "") {
    let btn = btncolor(color);
    return `<button id="${id}" data-toggle="tooltip" data-placement="bottom" data-html="true" 
    title="<span>Name: ${Name}</span><br>
    <span>Bike: ${Bike}</span><br>
    <span>Laps: ${laps}</span><br>
    <span>Place: ${pos}</span>" 
    class='btn ${btn} racebtngrp p-1'>${Num}</button>`;
}

async function initTables(db) {
    const seasons = await db.select({
        from: "Season",
    });
    if (seasons.length == 0) {
        var season = {
            Name: '2020-2021',
        };
        var noOfDataInserted = await db.insert({
            into: 'Season',
            values: [season]
        });
    }

    let rounds = await db.select({
        from: "Round",
    });
    if (rounds.length == 0) {
        for (i = 1; i <= 8; i++) {
            await insertdb('Round', {
                Name: 'Round ' + i,
                Season_id: 1
            })
        }
    }

    let races = await db.select({
        from: "Race",
    });
    if (races.length == 0) {
        for (i = 1; i <= 8; i++) {
            await insertdb('Race', {
                Name: 'Race 1',
                Order: 1,
                Season_id: 1,
                Round_id: i
            })
            await insertdb('Race', {
                Name: 'Race 2',
                Order: 1,
                Season_id: 1,
                Round_id: i
            })
            await insertdb('Race', {
                Name: 'Race 3',
                Order: 1,
                Season_id: 1,
                Round_id: i
            })
        }
    }
    const classes = await db.select({
        from: "Class",
    });
    if (classes.length == 0) {
        await insertdb('Class', { Name: "Pre 75 Smallbore", Group_id: 1 })
        await insertdb('Class', { Name: "Pre 75 Midbore", Group_id: 1 })
        await insertdb('Class', { Name: "Pre 75 Bigbore", Group_id: 1 })
        await insertdb('Class', { Name: "Pre 96 Womens", Group_id: 2 })
        await insertdb('Class', { Name: "Over 60", Group_id: 2 })
        await insertdb('Class', { Name: "Pre 86 Womens", Group_id: 2 })
        await insertdb('Class', { Name: "Pre 86 4T Over", Group_id: 3 })
        await insertdb('Class', { Name: "Pre 96 4T Over", Group_id: 3 })
        await insertdb('Class', { Name: "Pre 96 4T Under", Group_id: 3 })
        await insertdb('Class', { Name: "Pre 86 Enduro", Group_id: 4 })
        await insertdb('Class', { Name: "Pre 96 Enduro", Group_id: 4 })
        await insertdb('Class', { Name: "Pre 70", Group_id: 5 })
        await insertdb('Class', { Name: "Pre 78 Smallbore", Group_id: 5 })
        await insertdb('Class', { Name: "Pre 78 Midbore", Group_id: 5 })
        await insertdb('Class', { Name: "Pre 78 Bigbore", Group_id: 5 })
        await insertdb('Class', { Name: "Evo Bigbore", Group_id: 6 })
        await insertdb('Class', { Name: "Evo Midbore", Group_id: 6 })
        await insertdb('Class', { Name: "Evo Smallbore", Group_id: 6 })
        await insertdb('Class', { Name: "Pre 86 Midbore", Group_id: 7 })
        await insertdb('Class', { Name: "Pre 91 Midbore", Group_id: 7 })
        await insertdb('Class', { Name: "Pre 96 Midbore", Group_id: 8 })
        await insertdb('Class', { Name: "Pre 86 Smallbore", Group_id: 9 })
        await insertdb('Class', { Name: "Pre 91 Smallbore", Group_id: 9 })
        await insertdb('Class', { Name: "Pre 96 Smallbore", Group_id: 9 })
        await insertdb('Class', { Name: "Pre 86 Bigbore", Group_id: 10 })
        await insertdb('Class', { Name: "Pre 91 Bigbore", Group_id: 10 })
        await insertdb('Class', { Name: "Pre 96 Bigbore", Group_id: 10 })
    }
    const season_classes = await db.select({
        from: "Season_Class",
    });
    if (season_classes.length == 0) {
        for (i = 1; i <= 27; i++) {
            await insertdb('Season_Class', { Season_id: 1, Class_id: i })
        }
    }

    let numbers = [];
    let names = [];
    let class_ids = [];
    const results = await db.select({
        from: "Class",
    });

    for (let i = 0; i < results.length; i++) {
        var index = numbers.indexOf(results[i].Group_id);
        if (index == -1) {
            numbers.push(results[i].Group_id)
            names.push(results[i].Name)
            class_ids.push(`${results[i].id}`)
        } else {
            names[index] = names[index] + ", " + results[i].Name;
            class_ids[index] = class_ids[index] + "," + results[i].id;
        }
        
    }
    

    let groups = await db.select({
        from: "Group",
    });

    if (groups.length == 0) {
        for (let i = 0; i < names.length; i++) {
            insertdb('Group', { Name: names[i], Classes: class_ids[i] })
        }
    }
    loadAllSelect();
}
async function getTable(tbl) {
    const temp = await db.select({
        from: tbl,
    });
    return temp;
}

async function loadSelect(src, origin, originvalue) {
    $('#' + src).empty()
    let val = localStorage.getItem(src);
    let results = [];
    if (originvalue) {
        let origin_id = origin + "_id";
        qry = {
            [origin_id]: originvalue
        }
        results = await db.select({
            from: src,
            where: qry,
        });
    } else if (!origin) {
        results = await db.select({
            from: src,
        });
    }

    $('#' + src).append(val ? $(`<option value='0' disabled>Select ${src}</option>`) : $(`<option value='0' selected disabled>Select ${src}</option>`));
    for (let i = 0; i < results.length; i++) {
        $('#' + src).append(val == results[i].id ? $(`<option selected value="${results[i].id}">${results[i].Name}</option>`) : $(`<option value="${results[i].id}">${results[i].Name}</option>`));
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

function progressbar(id) {
    const html = `
        <div id="${id}_bar">
            <div class="row">
                <div class="col text-center">
                    ${id}
                </div>
            </div>
            <div class="progress">
                <div id="${id}" class="progress-bar progress-bar-striped" role="progressbar" style="width: 0">${id}</div>
            </div>
        <div/>`;
    return html;
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

async function Process_number() {
    let num = $('#Number_input').val().toUpperCase();
    let group = parseInt($('#Group').val());
    let race = parseInt($('#Race').val());
    if (group && race && num != "") {
        $('#Number_input').val("");
        var laprace = {
            Number: num,
            Group_id: group,
            Race_id: race,
        };
        try {
            var noOfDataInserted = await db.insert({
                into: 'Lap_Race',
                values: [laprace]
            });
            if (noOfDataInserted === 1) {
                refreshTableData();
            }
        } catch (ex) {
            alert(ex.message);
        }
    }
}


function registerEvents() {
    $("#browse").click(function () {
        $("#fileUpload").click();
    });
    $('#Number_input').on('keypress', function (e) {
        if (e.key == 'Enter') {
            Process_number();
        }
    });
    $('#delete').on('click', async function (e) {
        if ($("#selectall").hasClass("active")) {
            let num = $('#disp').html();
            let group = parseInt($('#Group').val());
            let race = parseInt($('#Race').val());
            await db.remove({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race,
                    Number: num
                }
            });
            refreshTableData();
        } else {
            let id = parseInt($('#disp').data('identity'));
            await db.remove({
                from: "Lap_Race",
                where: { id: id, }
            });
            refreshTableData();
        }
    })

    $('#moveup').on('click', async function (e) {
        if (!$("#moveup").hasClass("disabled")) {
            let id = $('#disp').data('identity');
            let group = parseInt($('#Group').val());
            let race = parseInt($('#Race').val());
            const results = await db.select({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race
                },
            });
            for (let i = 0; i < results.length; i++) {
                if (results[i].id == id && i > 0) {
                    let valuea = results[i].Number
                    let valueb = results[i - 1].Number
                    await db.update({
                        in: "Lap_Race", set: { Number: valueb }, where: { id: results[i].id }
                    });
                    await db.update({
                        in: "Lap_Race", set: { Number: valuea }, where: { id: results[i - 1].id }
                    });
                    $("#disp").data("identity", results[i - 1].id);
                    refreshTableData(results[i - 1].id);
                    return;
                }
            }
        }
    });
    $('#movedown').on('click', async function (e) {
        if (!$("#movedown").hasClass("disabled")) {
            let id = $('#disp').data('identity');
            let group = parseInt($('#Group').val());
            let race = parseInt($('#Race').val());
            const results = await db.select({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race
                },
            });
            for (let i = 0; i < results.length; i++) {
                if (results[i].id == id && i < results.length - 1) {
                    let valuea = results[i].Number
                    let valueb = results[i + 1].Number
                    await db.update({
                        in: "Lap_Race", set: { Number: valueb }, where: { id: results[i].id }
                    });
                    await db.update({
                        in: "Lap_Race", set: { Number: valuea }, where: { id: results[i + 1].id }
                    });
                    $("#disp").data("identity", results[i + 1].id);
                    refreshTableData(results[i + 1].id);
                    return;
                }
            }
        }
    });

    $('#Clear_all').on('click', function (e) {
        clear_all();
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    $('#Submit').on('click', function (e) {
        Process_number();
    });

    $('#download').on('click', function (e) {
        DownloadDatabase();
    });
    $('#selectall').on('click', function (e) {
        $('.entry').each(function () {
            if ($(this).html() == $('#disp').html()) {
                $(this).addClass("active");
            } else {
                $(this).removeClass("active");

            }
        });
        $("#selectall").addClass("active");
        $("#moveup").addClass("disabled");
        $("#movedown").addClass("disabled");
    });

    $('select').on('change', function (e) {
        localStorage.setItem(this.id, this.value);
        if (this.id == "Season") {
            localStorage.removeItem("Round");
            localStorage.removeItem("Race");
            localStorage.removeItem("Group");
        }
        if (this.id == "Round") {
            localStorage.removeItem("Race");
        }
        loadAllSelect()
        refreshTableData();
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

async function clear_laps() {
    await $(".lap-row").each(function (index, element) {
        $(this).html("");
    });
    await $(".lap").each(function (index, element) {
        $(this).removeClass("active");
    });
    for (i = 1; i <= 9; i++) {
        $('#laprow' + i).addClass("d-none");
    }
    $("#racercard").addClass("d-none");
}

async function clear_all() {
    $("#racercard").addClass("d-none");
    let group = parseInt($('#Group').val());
    let race = parseInt($('#Race').val());
    if (group && race) {
        try {
            await db.remove({
                from: 'Lap_Race',
                where: {
                    Group_id: group,
                    Race_id: race,
                },
            });
            refreshTableData();
        } catch (ex) {
            alert(ex.message);
        }
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