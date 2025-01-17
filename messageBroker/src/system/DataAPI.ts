import { DataSource } from "typeorm";
import { KeyValue } from "../entities/KeyValue";

export class DataAPI {
    private db: DataSource;

    constructor() {
        // get file path from cli args
        const filePath = process.argv[2] || "./db.sqlite";

        this.db = new DataSource({
            type: "sqlite",
            database: filePath,
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