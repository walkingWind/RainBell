"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const guards_1 = require("../guards");
const http_1 = require("./http");
const aws_1 = require("./utils/aws");
class DeployClient {
    constructor(appUserToken, client) {
        this.appUserToken = appUserToken;
        this.client = client;
    }
    getChannel(uuidOrTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = this.client.make('GET', `/deploy/channels/${uuidOrTag}`)
                .set('Authorization', `Bearer ${this.appUserToken}`)
                .send();
            const res = yield this.client.do(req);
            if (!guards_1.isDeployChannelResponse(res)) {
                throw http_1.createFatalAPIFormat(req, res);
            }
            return res.data;
        });
    }
    deploy(snapshot, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = this.client.make('POST', '/deploy/deploys')
                .set('Authorization', `Bearer ${this.appUserToken}`)
                .send({ snapshot, channel });
            const res = yield this.client.do(req);
            if (!guards_1.isDeployResponse(res)) {
                throw http_1.createFatalAPIFormat(req, res);
            }
            return res.data;
        });
    }
    getSnapshot(uuid, { fields = [] }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fields.indexOf('url') === -1) {
                fields.push('url');
            }
            const req = this.client.make('GET', `/deploy/snapshots/${uuid}`)
                .set('Authorization', `Bearer ${this.appUserToken}`)
                .query({ fields })
                .send();
            const res = yield this.client.do(req);
            if (!guards_1.isDeploySnapshotResponse(res)) {
                throw http_1.createFatalAPIFormat(req, res);
            }
            return res.data;
        });
    }
    requestSnapshotUpload(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            options.legacy_duplication = '1';
            const req = this.client.make('POST', '/deploy/snapshots')
                .set('Authorization', `Bearer ${this.appUserToken}`)
                .send(options);
            const res = yield this.client.do(req);
            if (!guards_1.isDeploySnapshotRequestResponse(res)) {
                throw http_1.createFatalAPIFormat(req, res);
            }
            if (options.user_metadata) {
                const updateMetaDataReq = this.client.make('PATCH', `/deploy/snapshots/${res.data.uuid}`)
                    .set('Authorization', `Bearer ${this.appUserToken}`)
                    .send({
                    'user_metadata': options.user_metadata
                });
                yield this.client.do(updateMetaDataReq);
            }
            return res.data;
        });
    }
    uploadSnapshot(snapshot, zip, progress) {
        return aws_1.s3SignedUpload(snapshot.presigned_post, zip, { progress });
    }
}
exports.DeployClient = DeployClient;
