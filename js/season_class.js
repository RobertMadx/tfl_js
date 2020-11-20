let selected = 0;

window.onload = async function () {
    initDb();
    //await loadseasons();
    //await loadclasses();
    refreshTableDataSeasons();
    refreshTableDataClasses();
    registerEvents();
};

async function registerEvents() {
    $('#delete').on('click', async function (e) {
        const id = await $(this).data("id")
        const table = await $(this).data("table")
        await deleterecords(id, table)
        refreshTableDataSeasons();
        refreshTableDataClasses();
        if (table == "Class"){
            await recreategroup()
        }
    })
    $('#SeasonName').keyup(async function (e) {
        const name = $(this).val()
        addnewseason(name, true)
    });
    $('#add_new_season').on('click', async function () {
        const name = $('#SeasonName').val()
        addnewseason(name)
    })
    $('.newclass').keyup(async function (e) {
        const name = $('#ClassName').val()
        const group = $('#GroupNumber').val()
        addnewclass(name,group, true)
    });
    $('.newclass').on("change",async function (e) {
        const name = $('#ClassName').val()
        const group = $('#GroupNumber').val()
        addnewclass(name,group, true)
    });

    $('#add_new_class').on('click', async function () {
        const name = $('#ClassName').val()
        const group = $('#GroupNumber').val()
        addnewclass(name,group)
    })
}

async function addnewseason(name, check = false) {
    const season_check = await db.select({
        from: "Season",
        where: {
            Name: name,
        }
    })
    if (season_check.length == 0 && name) {
        if (!check) {
            $("#SeasonName").val("")
            await insertdb("Season", {
                Name: name,
            })
            const new_season = await db.select({
                from: "Season",
                where: {
                    Name: name,
                }
            })

            for (let r = 1; r <= 10; r++) {
                await insertdb("Round", {
                    Season_id: new_season[0].id,
                    Name:`Round ${r}`
                })
            }
            const classes = await db.select({
                from: "Class",
            })
            for (let c = 0; c < classes.length; c++) {
                await insertdb("Season_Class", {
                    Season_id: new_season[0].id,
                    Class_id: classes[c].id,
                })           
            }

            refreshTableDataSeasons()
            $(`#add_new_season`).addClass("btn-secondary");
            $(`#add_new_season`).addClass("disabled");
            $(`#add_new_season`).removeClass("btn-success");
        } else {
            $(`#add_new_season`).removeClass("btn-secondary");
            $(`#add_new_season`).addClass("btn-success");
            $(`#add_new_season`).removeClass("disabled");
        }
    } else {
        $(`#add_new_season`).addClass("btn-secondary");
        $(`#add_new_season`).addClass("disabled");
        $(`#add_new_season`).removeClass("btn-success");
    }
}


async function refreshTableDataSeasons() {
    $("#seasons_body").html("");
    const seasons = await db.select({
        from: "Season",
    })
    for (let s = 0; s < seasons.length; s++) {
        const season_class = await db.select({
            from: "Season_Class",
            where: {
                Season_id: parseInt(seasons[s].id),
            },
        })
        let count_entries = 0;
        for (let sc = 0; sc < season_class.length; sc++) {

            const entries = await db.count({
                from: "Entry",
                where: {
                    Season_Class_id: parseInt(season_class[sc].id),
                },
            })
            count_entries += entries;
        }
        $(`#seasons_body`).append(await seasonrow(seasons[s].Name, seasons[s].id, season_class.length, count_entries));
    }

    $('.edits').on('input', async function (e) {
        const id = parseInt(e.target.dataset.id);
        const name = $(`#seasonname_${id}`).val().replace(`"`, "");
        $(`#seasonname_${id}`).val(name)
        updateseason(id, name, true)
    });
    $('.saves').on('click', async function (e) {
        const id = parseInt(e.target.dataset.id);
        if ($(`#saves_${id}`).prop("disabled")) return;
        const name = $(`#seasonname_${id}`).val().replace(`"`, "");
        updateseason(id, name)
    });
    $('.season').on('click', async function () {
        $('.season').removeClass("table-success");
        selected = parseInt($(this).attr("id").replace("season_",""));
        loadclasses();
    })
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    $('.deletes').on('click', async function (e) {
        let id = parseInt($(this).data("id"))
        let table = $(this).data("table")
        confirmDelete(id, table)
    })
}

async function updateseason(id, name, check = false) {
    let season_check = await db.select({
        from: "Season",
        where: {
            id: id,
        },
    })
    if (name != season_check[0].Name) {
        if (check) {
            $(`#saves_${id}`).removeClass("btn-secondary");
            $(`#saves_${id}`).addClass("btn-success");
            $(`#saves_${id}`).prop("disabled", false);
        } else {
            await db.update({
                in: "Season",
                set: {
                    Name: name,
                },
                where: {
                    id: parseInt(id),
                }
            });
            $(`#saves_${id}`).addClass("btn-secondary");
            $(`#saves_${id}`).removeClass("btn-success");
            $(`#saves_${id}`).prop("disabled", true);
        }
    } else {
        $(`#saves_${id}`).addClass("btn-secondary");
        $(`#saves_${id}`).removeClass("btn-success");
        $(`#saves_${id}`).prop("disabled", true);
    }
}

async function loadclasses() {
    if (selected == 0){
        $('.season_class').addClass("d-none");
        return;
    }
    $(`#season_${selected}`).addClass("table-success")
    const Season_Class = await db.select({
        from: "Season_Class",
        where: {
            Season_id: parseInt(selected)
        }
    })
    $('.season_class').removeClass("d-none");
    $('.season_class').removeClass("active");

    for (let sc = 0; sc < Season_Class.length; sc++) {
        $(`#select_${Season_Class[sc].Class_id}`).addClass("active");
    }
}

async function refreshTableDataClasses() {
    $("#classes_body").html("");
    const classes = await db.select({
        from: "Class",
    })
    for (let c = 0; c < classes.length; c++) {
        const season_class = await db.select({
            from: "Season_Class",
            where: {
                Class_id: parseInt(classes[c].id),
            },
        })
        let active = season_class.length > 0 ? "active" : "";
        let count_entries = 0;
        for (let sc = 0; sc < season_class.length; sc++) {
            const entries = await db.count({
                from: "Entry",
                where: {
                    Season_Class_id: parseInt(classes[c].id),
                },
            })
            count_entries += entries;
        }
        const count_group = await db.count({
            from: "Class",
            where: {
                Group_id: parseInt(classes[c].Group_id),
            },
        })
        $(`#classes_body`).append(await classrow(classes[c].Name, classes[c].id, classes[c].Group_id, count_entries, count_group, active));
    }
    $('.select').on('click', async function (e) {
        let class_id = $(this).children().data("class")
        await $(this).children().toggleClass("active");
        if ($(this).hasClass("active")){
            await db.remove({
                from: "Season_Class",
                where: {
                    Class_id: parseInt(class_id),
                    Season_id: parseInt(selected),
                },
            })
        } else {
            await db.insert({
                into: "Season_Class",
                values: [{
                    Class_id: parseInt(class_id),
                    Season_id: parseInt(selected),
                }],
            })
            
        }
    });
    $('.editc').on('input', async function (e) {
        const id = parseInt(e.target.dataset.id);
        const name = $(`#classname_${id}`).val().replace(`"`, "");
        const group = $(`#classgroup_${id}`).val()
        $(`#classname_${id}`).val(name)
        updateclass(id, name, group, true)
    });
    $('.savec').on('click', async function (e) {
        const id = parseInt(e.target.dataset.id);
        if ($(`#saver_${id}`).prop("disabled")) return;
        const name = $(`#classname_${id}`).val().replace(`"`, "");
        const group = $(`#classgroup_${id}`).val()
        updateclass(id, name, group)
    });
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    $('.deletec').on('click', async function (e) {
        let id = parseInt($(this).data("id"))
        let table = $(this).data("table")
        confirmDelete(id, table)
    })
}

async function updateclass(id, name, group, check = false) {
    let class_check = await db.select({
        from: "Class",
        where: {
            id: id,
        },
    })
    if (name != class_check[0].Name || parseInt(group) != class_check[0].Group_id) {
        if (check) {
            $(`#savec_${id}`).removeClass("btn-secondary");
            $(`#savec_${id}`).addClass("btn-success");
            $(`#savec_${id}`).prop("disabled", false);
        } else {
            await db.update({
                in: "Class",
                set: {
                    Name: name,
                    Group_id: parseInt(group),
                },
                where: {
                    id: parseInt(id),
                }
            });
            const class_check = await db.select({
                from: "Class",
            })
            $(`#savec_${id}`).addClass("btn-secondary");
            $(`#savec_${id}`).removeClass("btn-success");
            $(`#savec_${id}`).prop("disabled", true);
            await recreategroup()
        }
    } else {
        $(`#savec_${id}`).addClass("btn-secondary");
        $(`#savec_${id}`).removeClass("btn-success");
        $(`#savec_${id}`).prop("disabled", true);
    }
}

async function addnewclass(name,group, check = false) {
    const class_check = await db.select({
        from: "Class",
        where: {
            Name: name,
            Group_id:parseInt(group)
        }
    })
    if (class_check.length == 0 && name && group > 0) {
        if (!check) {
            $("#ClassName").val("")
            await insertdb("Class", {
                Name: name,
                Group_id:parseInt(group)
            })
            const new_class = await db.select({
                from: "Class",
                where: {
                    Name: name,
                    Group_id:parseInt(group)
                }
            })

            const seasons = await db.select({
                from: "Season",
            })
            for (let s = 0; s < seasons.length; s++) {
                await insertdb("Season_Class", {
                    Class_id: new_class[0].id,
                    Season_id: seasons[s].id,
                })           
            }
            await recreategroup()
            refreshTableDataClasses()
            $(`#add_new_class`).addClass("btn-secondary");
            $(`#add_new_class`).addClass("disabled");
            $(`#add_new_class`).removeClass("btn-success");
        } else {
            $(`#add_new_class`).removeClass("btn-secondary");
            $(`#add_new_class`).addClass("btn-success");
            $(`#add_new_class`).removeClass("disabled");
        }
    } else {
        $(`#add_new_class`).addClass("btn-secondary");
        $(`#add_new_class`).addClass("disabled");
        $(`#add_new_class`).removeClass("btn-success");
    }
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