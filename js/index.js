if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    // .then((reg) => console.log('service worker registered', reg))
    // .catch((err) => console.log('service worker not registered', err))
}

var db = new JsStore.Connection(new Worker("./js/jsstore.worker.min.js"));

window.onload = function () {
    refreshTableData();
    registerEvents();
    initDb();
};

async function initDb() {
    var isDbCreated = await db.initDb(getDbSchema());
    if (isDbCreated) {
        //console.log('db created');
    }
    else {
        //console.log('db opened');
    }
}

function getDbSchema() {
    var table = {
        name: 'Lap_Race',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Number: {
                notNull: true,
                dataType: 'string'
            },
            Group: {
                notNull: true,
                dataType: 'number'
            },
            Race_id: {
                notNull: true,
                dataType: 'number'
            },
        }
    }

    var db = {
        name: 'TheFinishLine',
        tables: [table]
    }
    return db;
}



function registerEvents() {
    $('#Number_input').on('keypress', function (e) {
        if (e.key == 'Enter') {
            let num = $('#Number_input').val();
            let group = parseInt($('#Group_select').val());
            let race = parseInt($('#Race_select').val());
            if (group && race && num != "") {
                $('#Number_input').val("");
                Process_number(num, group, race);
            }
        }
    });

    $('#Clear_all').on('click', function (e) {
        clear_all();
    });
    $('select').on('change', function (e) {
        refreshTableData();
    });

}


async function Process_number(num, group, race) {
    var numbers = [];
    var laps_done = [];

    var laprace = {
        Number: num,
        Group: group,
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



async function refreshTableData() {
    clear_laps();
    let group = parseInt($('#Group_select').val());
    let race = parseInt($('#Race_select').val());

    var numbers = [];
    var laps_done = [];
    var last_lap = [];

    if (group && race) {
        const results = await db.select({
            from: "Lap_Race",
            where: {
                Group: group,
                Race_id: race
            },
        });

        var lap = 1;
        results.forEach(function (n) {
            var index = numbers.indexOf(n.Number);
            if (index == -1) {
                numbers.push(n.Number)
                laps_done.push(1);
                last_lap.push(1);
                last_lap.push(lap);
            } else {
                laps_done[index]++;
                if (lap < laps_done[index] || last_lap[index] == lap){
                    lap++
                }
                last_lap[index] = lap;
            }
            $('#Lap' + lap).append("<button class='btn btn-outline-primary entry'>" + n.Number + "</button>");
        })
        $('#lapbtn' + lap).addClass("active");
    }
}

function clear_laps(){
    $(".lap-row").each(function (index, element) {
        $(this).html("");
    });
    $(".lap").each(function (index, element) {
        $(this).removeClass("active");
    });
}

async function clear_all() {
    let group = parseInt($('#Group_select').val());
    let race = parseInt($('#Race_select').val());
    if (group && race) {
        try {
            await db.remove({
                from: 'Lap_Race',
                where: {
                    Group: group,
                    Race_id: race,
                },
            });
            refreshTableData();
        } catch (ex) {
            alert(ex.message);
        }
    }
}