import { DataSource } from "typeorm";
import { KeyValue } from "../entities/KeyValue";

export class DataAPI {
    private db: DataSource;

    constructor() {
        this.db = new DataSource({
            type: "sqlite",
            database: "db.sqlite",
            entities: [KeyValue],
            synchronize: true
        });
    }

    public async connect() {
       await this.db.initialize()
       console.log("💾 Database connected");
    }

    public async getKeyValue(key: string) {
        const keyValueRepo = this.db.getRepository(KeyValue);
        const keyValue = await keyValueRepo.findOneBy({ key });
        if (keyValue) {
            return keyValue.value;
        }
        return undefined;
    }

    public async setKeyValue(key: string, value: string) {
        const keyValueRepo = this.db.getRepository(KeyValue);
        const keyValue = await keyValueRepo.findOneBy({ key });
        if (keyValue) {
            keyValue.value = value;
            await keyValueRepo.save(keyValue)
        } else {
            const nKey = new KeyValue();
            nKey.key = key;
            nKey.value = value;
            await keyValueRepo.save(nKey)
        }
    }
}