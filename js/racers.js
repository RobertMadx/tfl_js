var racersortby = "FirstName"
var racersortbytype = "asc"
var max_lines = 10;
var offset = 0;
var page = 1;
var racers;

window.onload = async function () {
    initDb();
    await loadracers();
    refreshTableData();
    registerEvents();
};

async function registerEvents() {
    $('select').on('change', async function (e) {
        await loadracers();
        refreshTableData();
    });
    $('.sort').on('click', async function (e) {
        racersortby = e.target.innerHTML.replace(" ", "");
        racersortbytype = racersortbytype == "asc" ? "desc" : "asc";
        await loadracers();
        refreshTableData();
    })
    $('.new').keyup(async function (e) {
        let first = $("#FirstName").val()
        let last = $("#LastName").val()
        await loadracers(first, last);
        refreshTableData();
        const racer_check = await db.select({
            from: "Racer",
            where: {
                FirstName: first,
                LastName: last
            }
        })
        if (racer_check.length == 0 && first && last) {
            $(`#add_new`).removeClass("btn-secondary");
            $(`#add_new`).removeClass("disabled");
            $(`#add_new`).addClass("btn-success");
        } else {
            $(`#add_new`).addClass("btn-secondary");
            $(`#add_new`).addClass("disabled");
            $(`#add_new`).removeClass("btn-success");
        }
    });
    $('#add_new').on('click', async function () {
        let first = $("#FirstName").val()
        let last = $("#LastName").val()
        const racer_check = await db.select({
            from: "Racer",
            where: {
                FirstName: first,
                LastName: last
            }
        })
        if (racer_check.length == 0 && first && last) {
            $("#FirstName").val("")
            $("#LastName").val("")
            await insertdb("Racer",{
                FirstName: first,
                LastName: last,
            })
            await loadracers();
            refreshTableData()
            $(`#add_new`).addClass("btn-secondary");
            $(`#add_new`).addClass("disabled");
            $(`#add_new`).removeClass("btn-success");
        } 
    })
   
}

async function loadracers(first = null, last = null) {
    page = 1;
    if (!first && !last) {
        racers = await db.select({
            from: "Racer",
            order: {
                by: racersortby,
                type: racersortbytype
            }
        })
    } else {
        racers = await db.select({
            from: "Racer",
            where: {
                FirstName: {
                    like: `%${first}%`
                },
                LastName: {
                    like: `%${last}%`
                },
            },
            order: {
                by: racersortby,
                type: racersortbytype
            }
        })
    }
}

async function refreshTableData() {
    $("#racers_body").html("");
    let pages = Math.ceil(racers.length / max_lines) - 1;
    offset = page > 1 ? (page * max_lines) : 0
    for (let r = offset; (r < racers.length && r < (offset + max_lines)); r++) {
        $(`#racers_body`).append(await racerrow(racers[r].FirstName, racers[r].LastName, racers[r].id));
    }
    $("#paginate").html("");
    if (page == 1) {
        $("#paginate").append(await pageli(1))
        $("#paginate").append(await pageli(3, page))
        $("#paginate").append(await pageli(2, page + 1))
        $("#paginate").append(await pageli(2, page + 2))
        $("#paginate").append(await pageli(4))
    } else if (page == pages && pages > 2) {
        $("#paginate").append(await pageli(6))
        $("#paginate").append(await pageli(2, page - 2))
        $("#paginate").append(await pageli(2, page - 1))
        $("#paginate").append(await pageli(3, page))
        $("#paginate").append(await pageli(5))
    } else {
        $("#paginate").append(await pageli(6))
        $("#paginate").append(await pageli(2, page - 1))
        $("#paginate").append(await pageli(3, page))
        $("#paginate").append(await pageli(2, page + 1))
        $("#paginate").append(await pageli(4))
    }

    $('.page-link').on('click', async function (e) {
        e.preventDefault();
        if (e.target.innerHTML == "Next") {
            if (page < pages) {
                page++
                refreshTableData()
            }
        } else if (e.target.innerHTML == "Previous") {
            if (page > 1) {
                page--
                refreshTableData()
            }
        } else {
            page = parseInt(e.target.innerHTML)
            refreshTableData()
        }
    })
    $('.racer').on('click', async function () {
        $('.racer').removeClass("table-success");
        $(this).addClass("table-success");
        $(this).attr("id");
        const bikes = await db.select({
            from: "Bike",
            where: {
                Racer_id: parseInt($(this).attr("id"))
            }
        })
        $('#bikes_body').html("");
        for (let b = 0; b < bikes.length; b++) {
            $('#bikes_body').append(await bikerow(bikes[b].Year,bikes[b].Model,bikes[b].CC,bikes[b].id))
            
        }
        console.log($(this).attr("id"))
        console.log(bikes)
    })

}