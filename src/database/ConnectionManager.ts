import * as fs from "fs";
import * as mysql from "mysql";
import { Global } from "../common/Global";
import { Console } from "../common/OutputChannel";
import { ConnectionInfo } from "../model/interface/connection";
import { QueryUnit } from "./QueryUnit";

export class ConnectionManager {

    private static lastConnectionOption: ConnectionInfo;
    private static activeConnection: { [key: string]: mysql.Connection } = {};

    public static getLastConnectionOption() {
        return this.lastConnectionOption;
    }

    public static getLastActiveConnection() {

        if (!this.activeConnection) {
            return undefined;
        }


        return this.getConnection(Object.assign({ multipleStatements: true }, this.lastConnectionOption));

    }

    public static getConnection(connectionOptions: ConnectionInfo, changeActive: boolean = false): Promise<mysql.Connection> {

        connectionOptions.multipleStatements = true;
        this.lastConnectionOption = connectionOptions;
        if (changeActive) { Global.updateStatusBarItems(connectionOptions); }
        const key = `${connectionOptions.host}_${connectionOptions.port}_${connectionOptions.user}_${connectionOptions.password}`;

        return new Promise((resolve, reject) => {
            const connection = this.activeConnection[key];
            if (connection && connection.state == 'authenticated') {
                if (connectionOptions.database) {
                    QueryUnit.queryPromise(connection, `use \`${connectionOptions.database}\``).then(() => {
                        resolve(connection);
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve(connection);
                }
            } else {
                this.activeConnection[key] = this.createConnection(connectionOptions);
                this.activeConnection[key].connect((err: Error) => {
                    if (!err) {
                        resolve(this.activeConnection[key]);
                    } else {
                        this.activeConnection = {};
                        Console.log(`${err.stack}\n${err.message}`);
                        reject(err.message);
                    }
                });
            }

        });

    }


    public static createConnection(connectionOptions: ConnectionInfo): mysql.Connection {
        const newConnectionOptions: any = Object.assign({ useConnectionPooling: true }, connectionOptions);
        if (connectionOptions.certPath && fs.existsSync(connectionOptions.certPath)) {
            newConnectionOptions.ssl = {
                ca: fs.readFileSync(connectionOptions.certPath),
            };
        }

        this.lastConnectionOption = newConnectionOptions;
        return mysql.createConnection(newConnectionOptions);

    }



}