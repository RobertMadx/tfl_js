var jsstoreCon = new JsStore.Connection(new Worker("js/jsstore.worker.min.js"));

window.onload = function () {
    refreshTableData();
    registerEvents();
    initDb();
};

async function initDb() {
    var isDbCreated = await jsstoreCon.initDb(getDbSchema());
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
            Order: {
                dataType: 'number'
            },
            Lap: {
                dataType: 'number'
            },
            Laps_done: {
                dataType: 'number'
            },
            Group: {
                dataType: 'number'
            },
            Race_id: {
                dataType: 'number'
            },
            Season_id: {
                dataType: 'number'
            },
            Entry_id: {
                dataType: 'number'
            },
            Class_id: {
                dataType: 'number'
            },
            Class_Name: {
                dataType: 'string'
            }
        }
    }

    var db = {
        name: 'My-Db',
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

    $('#Input_form').on('submit', function (e) {
        return false;
    });

    $('#Clear_all').on('click', function (e) {
        clear_all();
    });
    $('select').on('change', function (e) {
        refreshTableData();
    });

}


async function Process_number(num, group, race) {

    const results = await jsstoreCon.select({
        from: "Lap_Race",
        where: {
            Group: group,
            Race_id: race
        },
        order: {
            by: 'Order',
            type: 'desc'
        }
    });
    var order = results.length > 0 ? results[0].Order + 1 : 1;
    if (results.length > 0) {
        const results2 = await jsstoreCon.select({
            from: "Lap_Race",
            where: {
                Group: group,
                Race_id: race
            },
            aggregate: {
                max: 'Lap',
            }
        });
        var lap = results2[0]["max(Lap)"];
        const results3 = await jsstoreCon.count({
            from: "Lap_Race",
            where: {
                Number: num,
                Group: group,
                Race_id: race
            }
        });
        var laps_done = results3 ? results3 + 1 : 1;

    } else {
        var lap = 1;
        var laps_done = 1;
    }

    const results4 = await jsstoreCon.select({
        from: "Lap_Race",
        where: {
            Number: num,
            Group: group,
            Race_id: race,
            Lap: Math.max(laps_done, lap),
        }
    });

    if (results4.length > 0) {
        laps_done = Math.max(laps_done, lap) + 1;
    }

    var laprace = {
        Number: num,
        Order: order,
        Lap: Math.max(laps_done, lap),
        Laps_done: laps_done,
        Group: group,
        Race_id: race,
    };
    try {
        var noOfDataInserted = await jsstoreCon.insert({
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
    let group = parseInt($('#Group_select').val());
    let race = parseInt($('#Race_select').val());
    if (group && race) {
        const results = await jsstoreCon.select({
            from: "Lap_Race",
            where: {
                Group: group,
                Race_id: race
            },
            order: {
                by: 'Order',
                type: 'desc'
            }
        });
        var order = results.length > 0 ? results[0].Order + 1 : 1;
        if (results.length > 0) {
            const results2 = await jsstoreCon.select({
                from: "Lap_Race",
                where: {
                    Group: group,
                    Race_id: race
                },
                aggregate: {
                    max: 'Lap',
                }
            });
            var maxlap = results2[0]["max(Lap)"];
        }
        try {
            var htmlString = "";
            var lap_race = await jsstoreCon.select({
                from: 'Lap_Race',
                where: {
                    Group: group,
                    Race_id: race,
                },
                order: [{
                    by: 'Laps_done',
                    type: 'desc' //supprted sort type is - asc,desc
                },
                {
                    by: 'Order',
                    type: 'asc' //supprted sort type is - asc,desc
                }]
            });
            lap_race.forEach(function (lr) {
                htmlString += "<tr ItemId=" + lr.id + "><td>" +
                    lr.Number + "</td><td>" +
                    lr.Order + "</td><td>" +
                    lr.Lap + "</td><td>" +
                    lr.Laps_done + "</td><td>" +
                    lr.Group + "</td><td>" +
                    lr.Race_id + "</td><td>";
            })
            $('#tblGrid tbody').html(htmlString);
        } catch (ex) {
            alert(ex.message)
        }
        for (i = 1; i <= 10; i++) {
            var htmlString = "";
            var laprace = await jsstoreCon.select({
                from: 'Lap_Race',
                where: {
                    Group: group,
                    Race_id: race,
                    Lap: i
                },
                order: [{
                    by: 'Laps_done',
                    type: 'desc' //supprted sort type is - asc,desc
                },
                {
                    by: 'Order',
                    type: 'asc' //supprted sort type is - asc,desc
                }]
            });
            laprace.forEach(function (lr) {
                htmlString += "<button class='btn btn-outline-primary'>" + lr.Number + "</button>";
            })
            $('#Lap' + i).html(htmlString);
        }
    } else {
        $('#tblGrid tbody').html("");
    }
}

async function clear_all() {
    let group = parseInt($('#Group_select').val());
    let race = parseInt($('#Race_select').val());
    if (group && race) {
        try {
            await jsstoreCon.remove({
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