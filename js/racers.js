var racersortby = "FirstName"
var racersortbytype = "asc"
var max_lines = 15;
var offset = 0;
var page = 1;
var racers;
var selected = 0;

window.onload = async function () {
    await initDb();
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
    $('#delete').on('click', async function (e) {
        const id = await $(this).data("id")
        const table = await $(this).data("table")
        await deleterecords(id, table)
        if (table == "Racer") {
            await loadracers();
            refreshTableData();
        } else {
            loadbikes();
        }
        $("#FirstName").val("")
        $("#LastName").val("")
        $(`#add_new`).addClass("btn-secondary");
        $(`#add_new`).addClass("disabled");
        $(`#add_new`).removeClass("btn-success");
    })
    $('.newracer').keyup(async function (e) {
        const first = $("#FirstName").val()
        const last = $("#LastName").val()
        addnewracer(first, last, true)
    });
    $('#add_new_racer').on('click', async function () {
        const first = $("#FirstName").val()
        const last = $("#LastName").val()
        addnewracer(first, last)
    })
    $('.newbike').keyup(async function (e) {
        const racer_id = $("#bikefor").data("racer")
        const year = $("#Year").val()
        const model = $("#Model").val()
        const cc = $("#CC").val()
        addnewbike(racer_id,year,model,cc,true)
    });
    $('#add_new_bike').on('click', async function () {
        const racer_id = $("#bikefor").data("racer")
        const year = $("#Year").val()
        const model = $("#Model").val()
        const cc = $("#CC").val()
        addnewbike(racer_id,year,model,cc)
    })

}

async function addnewracer(first, last, check = false) {
    if (check) {
        await loadracers(first, last);
        refreshTableData();
    }
    const racer_check = await db.select({
        from: "Racer",
        where: {
            FirstName: first,
            LastName: last
        }
    })
    if (racer_check.length == 0 && first && last) {
        if (!check) {
            $("#FirstName").val("")
            $("#LastName").val("")
            await insertdb("Racer", {
                FirstName: first,
                LastName: last,
            })
            await loadracers();
            refreshTableData()
            $(`#add_new_racer`).addClass("btn-secondary");
            $(`#add_new_racer`).addClass("disabled");
            $(`#add_new_racer`).removeClass("btn-success");
        } else {
            $(`#add_new_racer`).removeClass("btn-secondary");
            $(`#add_new_racer`).addClass("btn-success");
            $(`#add_new_racer`).removeClass("disabled");
        }
    } else {
        $(`#add_new_racer`).addClass("btn-secondary");
        $(`#add_new_racer`).addClass("disabled");
        $(`#add_new_racer`).removeClass("btn-success");
    }
}

async function addnewbike(racer_id, year, model, cc, check = false) {
    
    if (isNaN(year) || isNaN(year)){
        $(`#add_new_bike`).addClass("btn-secondary");
        $(`#add_new_bike`).addClass("disabled");
        $(`#add_new_bike`).removeClass("btn-success");
        return;
    } 
    cc = cc==""?0:cc;
    year = year==""?0:year;
    const bike_check = await db.select({
        from: "Bike",
        where: {
            Racer_id:racer_id,
            Year: parseInt(year),
            Model: model,
            CC: parseInt(cc)
        }
    })
    if (bike_check.length == 0 && model != "") {
        if (!check) {
            $("#Year").val("")
            $("#Model").val("")
            $("#CC").val("")
            await insertdb("Bike", {
                Racer_id:racer_id,
                Year: parseInt(year),
                Model: model,
                CC: parseInt(cc)
            })
            loadbikes()
            $(`#add_new_bike`).addClass("btn-secondary");
            $(`#add_new_bike`).addClass("disabled");
            $(`#add_new_bike`).removeClass("btn-success");
        } else {
            $(`#add_new_bike`).removeClass("btn-secondary");
            $(`#add_new_bike`).addClass("btn-success");
            $(`#add_new_bike`).removeClass("disabled");
        }
    } else {
        $(`#add_new_bike`).addClass("btn-secondary");
        $(`#add_new_bike`).addClass("disabled");
        $(`#add_new_bike`).removeClass("btn-success");
    }
}

async function loadracers(first = null, last = null) {
    page = 1;
    selected = 0;
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
        const bikes_count = await db.count({
            from: "Bike",
            where: {
                Racer_id: parseInt(racers[r].id),
            },
        })
        const entries = await db.select({
            from: "Entry",
            where: {
                Racer_id: parseInt(racers[r].id),
            },
        })
        let count_results = 0;
        for (let e = 0; e < entries.length; e++) {
            const results_count = await db.count({
                from: "Result",
                where: {
                    Entry_id: entries[e].id
                }
            })
            count_results += results_count
        }
        $(`#racers_body`).append(await racerrow(racers[r].FirstName, racers[r].LastName, racers[r].id, entries.length, bikes_count, count_results));
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
    $('.editr').on('input', async function (e) {
        const id = parseInt(e.target.dataset.id);
        const first = $(`#firstname_${id}`).val().replace(`"`, "");
        const last = $(`#lastname_${id}`).val().replace(`"`, "");
        $(`#firstname_${id}`).val(first)
        $(`#lastname_${id}`).val(last)
        updateracer(id, first, last, true)
    });
    $('.saver').on('click', async function (e) {
        const id = parseInt(e.target.dataset.id);
        if ($(`#saver_${id}`).prop("disabled")) return;
        const first = $(`#firstname_${id}`).val().replace(`"`, "");
        const last = $(`#lastname_${id}`).val().replace(`"`, "");
        updateracer(id, first, last)
    });
    $('.racer').on('click', async function () {
        $('.racer').removeClass("table-success");
        $(this).addClass("table-success");
        selected = parseInt($(this).attr("id"));
        loadbikes()
    })
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    $('.deleter').on('click', async function (e) {
        let id = parseInt($(this).data("id"))
        let table = $(this).data("table")
        confirmDelete(id, table)
    })
    loadbikes()
}

function enablebikes(status = false) {
    if (!status){
        $('#Year').prop("disabled", true);
        $('#Model').prop("disabled", true);
        $('#CC').prop("disabled", true);
    } else {
        $('#Year').prop("disabled", false);
        $('#Model').prop("disabled", false);
        $('#CC').prop("disabled", false);
    }
}

async function updateracer(id, first, last, check = false) {
    let racer_check = await db.select({
        from: "Racer",
        where: {
            id: id,
        },
    })
    if (first != racer_check[0].FirstName || last != racer_check[0].LastName) {
        if (check) {
            $(`#saver_${id}`).removeClass("btn-secondary");
            $(`#saver_${id}`).addClass("btn-success");
            $(`#saver_${id}`).prop("disabled", false);
        } else {
            await db.update({
                in: "Racer",
                set: {
                    FirstName: first,
                    LastName: last,
                },
                where: {
                    id: parseInt(id),
                }
            });
            $(`#saver_${id}`).addClass("btn-secondary");
            $(`#saver_${id}`).removeClass("btn-success");
            $(`#saver_${id}`).prop("disabled", true);
        }
    } else {
        $(`#saver_${id}`).addClass("btn-secondary");
        $(`#saver_${id}`).removeClass("btn-success");
        $(`#saver_${id}`).prop("disabled", true);
    }
}

async function loadbikes() {

    if (selected == 0) {
        enablebikes(false)
        $('#bikes_body').html("");
        return;
    } 
    const first = $(`#${selected}`).data("firstname")
    const last = $(`#${selected}`).data("lastname")
    
    enablebikes(true)
    $(`#${selected}`).addClass("table-success")
    const bikes = await db.select({
        from: "Bike",
        where: {
            Racer_id: parseInt(selected)
        }
    })
    $('#bikefor').html(` for ${first} ${last}`)
    $('#bikefor').data("racer",selected)
    $('#bikes_body').html("");
    for (let b = 0; b < bikes.length; b++) {
        $('#bikes_body').append(await bikerow(bikes[b].Year, bikes[b].Model, bikes[b].CC, bikes[b].id))
    }
    $('.deleteb').on('click', async function (e) {
        let id = parseInt($(this).data("id"))
        let table = $(this).data("table")
        confirmDelete(id, table)
    })
    $('.editb').on('input', async function (e) {
        const id = parseInt(e.target.dataset.id);
        const year = parseInt($(`#Year_${id}`).val().replace(`"`, ""));
        const model = $(`#Model_${id}`).val().replace(`"`, "");
        const cc = parseInt($(`#CC_${id}`).val().replace(`"`, ""));
        $(`#Year_${id}`).val(year)
        $(`#Model_${id}`).val(model)
        $(`#CC_${id}`).val(cc)
        updatebike(id, year, model, cc, true)
    });
    $('.saveb').on('click', async function (e) {
        const id = parseInt(e.target.dataset.id);
        if ($(`#saveb_${id}`).prop("disabled")) return;
        const year = parseInt($(`#Year_${id}`).val().replace(`"`, ""));
        const model = $(`#Model_${id}`).val().replace(`"`, "");
        const cc = parseInt($(`#CC_${id}`).val().replace(`"`, ""));
        $(`#Year_${id}`).val(year)
        $(`#Model_${id}`).val(model)
        $(`#CC_${id}`).val(cc)
        updatebike(id, year, model, cc)
    });
}

async function updatebike(id, year, model, cc, check = false) {
    let bike_check = await db.select({
        from: "Bike",
        where: {
            id: id,
        },
    })
    if (year != bike_check[0].Year || model != bike_check[0].Model || cc != bike_check[0].CC) {
        if (check) {
            $(`#saveb_${id}`).removeClass("btn-secondary");
            $(`#saveb_${id}`).addClass("btn-success");
            $(`#saveb_${id}`).prop("disabled", false);
        } else {
            await db.update({
                in: "Bike",
                set: {
                    Year: year,
                    Model: model,
                    CC: cc,
                },
                where: {
                    id: id,
                }
            });
            $(`#saveb_${id}`).addClass("btn-secondary");
            $(`#saveb_${id}`).removeClass("btn-success");
            $(`#saveb_${id}`).prop("disabled", true);
        }
    } else {
        $(`#saveb_${id}`).addClass("btn-secondary");
        $(`#saveb_${id}`).removeClass("btn-success");
        $(`#saveb_${id}`).prop("disabled", true);
    }
}