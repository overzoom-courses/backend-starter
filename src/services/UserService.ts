import { provide } from "inversify-binding-decorators";
import { UserModel, User, UserDocument, UserPasswordUpdate } from "@models/UserModel";
import { comparePasswords } from "@utils/crypto";
import { FilterQuery, PaginateOptions, PaginateResult, UpdateQuery } from "mongoose";
import { QueryOptions } from "@utils/pagination";
import { unmanaged } from "inversify";
import httpErrors from "http-errors";

@provide(UserService)
export class UserService {

    constructor(@unmanaged() private userModel = UserModel) {}

    public async save(user: User): Promise<UserDocument> {
        return await this.userModel.create(user);
    }

    public async findById(id: string, options?: QueryOptions): Promise<UserDocument> {
        return await this.userModel.findById(id)
            .populate(options?.populate || "")
            .select(options?.select || "")
            .orFail()
            .exec();
    }

    public async findOne(query?: FilterQuery<UserDocument>, options?: QueryOptions): Promise<UserDocument> {
        return await this.userModel.findOne(query || {})
            .populate(options?.populate || "")
            .select(options?.select || "")
            .orFail()
            .exec();
    }

    public async find(query?: FilterQuery<UserDocument>, options?: QueryOptions): Promise<UserDocument[]> {
        return await this.userModel.find(query || {})
            .populate(options?.populate || "")
            .select(options?.select || "")
            .orFail()
            .exec();
    }

    public async paginate(query: FilterQuery<UserDocument>, options: PaginateOptions): Promise<PaginateResult<UserDocument>> {
        return this.userModel.paginate(query, options);
    }

    public async updateById(id: string, updateBody: UpdateQuery<UserDocument>): Promise<UserDocument> {
        return this.userModel.findByIdAndUpdate(id, updateBody, { new: true });
    }

    public async updateOne(query: FilterQuery<UserDocument>, updateBody: UpdateQuery<UserDocument>): Promise<UserDocument> {
        return this.userModel.findByIdAndUpdate(query, updateBody, { new: true });
    }

    public async updatePassword(user: UserDocument, passwordUpdate: UserPasswordUpdate): Promise<UserDocument> {
        if (!await comparePasswords(user.password, passwordUpdate.currentPassword)) {
            throw new httpErrors.Unauthorized("Wrong old password!");
        }

        return this.userModel.findByIdAndUpdate(user.id, { password: passwordUpdate.newPassword }, { new: true })
            .orFail()
            .exec();
    }

    public async countDocuments(query?: FilterQuery<UserDocument>): Promise<number> {
        return !query || query === {} ?
            this.userModel.estimatedDocumentCount().exec() : // Faster
            this.userModel.countDocuments(query || {}).orFail().exec(); // Slower
    }

    public async deleteById(id: string): Promise<UserDocument> {
        return this.userModel.findOneAndDelete({ _id: id })
            .orFail()
            .exec();
    }

}
