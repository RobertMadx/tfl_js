window.onload = function () {
    initDb();
    loadAllSelect();
    refreshTableData();
    registerEvents();
};

async function loadAllSelect() {
    await loadSelect("Season");
    await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
    await loadSelect("Group");
}

function registerEvents() {
    $('select').on('change', async function (e) {
        localStorage.setItem(this.id, this.value);
        if (this.id == "Season") {
            localStorage.removeItem("Round");
            localStorage.removeItem("Group");
            await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
            await loadSelect("Group");
        }
        refreshTableData();
    });

}

async function refreshTableData(selected = "") {

    let group = parseInt(localStorage.getItem("Group"));
    let round = parseInt(localStorage.getItem("Round"));
    let season = parseInt(localStorage.getItem("Season"));
}