function getDbSchema() {
    var Lap_Race = {
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
            Group_id: {
                notNull: true,
                dataType: 'number'
            },
            Race_id: {
                notNull: true,
                dataType: 'number'
            },
        }
    }
    var Racer = {
        name: 'Racer',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            FirstName: {
                notNull: true,
                dataType: 'string'
            },
            LastName: {
                notNull: true,
                dataType: 'string'
            },
        }
    }
    var Bike = {
        name: 'Bike',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Racer_id: {
                notNull: true,
                dataType: 'number'
            },
            Year: {
                dataType: 'number'
            },
            Model: {
                dataType: 'string'
            },
            CC: {
                dataType: 'number'
            },
        }
    }
    var Class = {
        name: 'Class',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                notNull: true,
                dataType: 'string'
            },
            Group_id: {
                dataType: 'number'
            },
        }
    }
    var Season = {
        name: 'Season',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                notNull: true,
                dataType: 'string'
            },
        }
    }
    var Season_Class = {
        name: 'Season_Class',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Season_id: {
                notNull: true,
                dataType: 'number'
            },
            Class_id: {
                notNull: true,
                dataType: 'number'
            },
        }
    }
    var Season = {
        name: 'Season',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                notNull: true,
                dataType: 'string'
            },
        }
    }
    var Round = {
        name: 'Round',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                notNull: true,
                dataType: 'string'
            },
            Season_id: {
                notNull: true,
                dataType: 'number'
            },
        }
    }
    var Group = {
        name: 'Group',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                notNull: true,
                dataType: 'string'
            },
            Classes: {
                notNull: true,
                dataType: 'string'
            },
        }
    }
    var Race = {
        name: 'Race',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                notNull: true,
                dataType: 'string'
            },
            Round_id: {
                notNull: true,
                dataType: 'number'
            },
            Season_id: {
                notNull: true,
                dataType: 'number'
            },
        }
    }
    var Entry = {
        name: 'Entry',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Racer_id: {
                notNull: true,
                dataType: 'number'
            },
            Bike_id: {
                dataType: 'number'
            },
            Season_Class_id: {
                notNull: true,
                dataType: 'number'
            },
            Number: {
                dataType: 'string'
            },
        }
    }
    var Result = {
        name: 'Result',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            Entry_id: {
                notNull: true,
                dataType: 'number'
            },
            Race_id: {
                notNull: true,
                dataType: 'number'
            },
            Position: {
                notNull: true,
                dataType: 'number'
            },
            Points: {
                notNull: true,
                dataType: 'number'
            },
        }
    }
    

    var db = {
        name: 'TheFinishLine',
        tables: [Lap_Race,Racer,Class,Season,Season_Class,Round,Race,Entry,Bike,Result,Group]
    }
    return db;
}