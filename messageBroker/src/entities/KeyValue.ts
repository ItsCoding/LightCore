import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class KeyValue {
    @PrimaryColumn()
    key: string

    @Column()
    value: string

}