/**
 * Copyright (C) 2017 Auralia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {NsApi, TelegramType} from "nsapi";
import {NsTgApi, Recipient} from "nstg"
import Ui from "./ui";
import * as util from "util";

/**
 * Contains the main application logic.
 */
export default class App {
    private _nstg?: NsTgApi;
    private _cancel: boolean;
    private _pause: boolean;
    private _jobId: string;

    /**
     * Initializes a new instance of the App class.
     */
    constructor() {
        this.reset();
    }

    /**
     * Logs into or restores the nations given by the specified credentials,
     * depending on the mode specified.
     *
     * @param userAgent The user agent specified by the user.
     * @param clientKey The client key to be used by the API.
     * @param trl The TRL string representing the recipients to send
     *            telegrams to.
     * @param telegramId The telegram ID to be used by the API.
     * @param telegramKey The secret key to be used by the API.
     * @param telegramType The type of the telegram.
     * @param dryRun Whether to actually not send any telegrams.
     * @param refresh Whether the list of recipients should be refreshed by
     *                re-evaluating the TRL string at periodic intervals.
     * @param verbose Whether or not to print out detailed error messages.
     */
    public async start(userAgent: string, clientKey: string, trl: string,
                       telegramId: string, telegramKey: string,
                       telegramType: TelegramType, dryRun: boolean,
                       refresh: boolean, verbose: boolean): Promise<void> {
        this.reset();

        const nsapi = new NsApi(
            `nstg-web (maintained by Auralia, currently`
            + ` used by "${userAgent}")`,
            true);
        this._nstg = new NsTgApi(nsapi, clientKey);

        this._nstg.onJobComplete = () => {
            if (this._cancel) {
                Ui.log("info", "Process cancelled.");
            } else {
                Ui.log("info", "Process complete.");
            }

            if (typeof this._nstg !== "undefined") {
                this._nstg.cleanup();
            }
            nsapi.cleanup();

            Ui.handleFinish();
        };
        this._nstg.onJobStart = (jobId: string) => {
            if (typeof this._nstg !== "undefined") {
                const job = this._nstg.getJob(jobId);
                if (typeof job !== "undefined") {
                    Ui.log(
                        "info",
                        `Sending telegrams to the following nations:`
                        + ` ${job.recipients.map(r => r.nation)}`);
                } else {
                    Ui.log("error", "Failed to identify telegram recipients");
                }
            } else {
                Ui.log("error", "Internal error");
            }
        };
        this._nstg.onTgFailure = (recipient: Recipient) => {
            Ui.log("error", `Failed to send telegram to ${recipient.nation}`);
            if (verbose) {
                Ui.log("error", util.inspect(recipient.status.err));
            }
        };
        this._nstg.onTgSuccess = (recipient: Recipient) => {
            Ui.log("info", `Sent telegram to ${recipient.nation}`);
            Ui.handleTgSuccess(recipient.nation);
        };

        Ui.log("info", "Evaluating Template Recipient Language string...");
        try {
            this._jobId = await this._nstg.sendTelegramsTrl(
                trl,
                {
                    telegramId,
                    telegramKey,
                    telegramType,
                    skipIfCampaignBlocked: false,
                    skipIfRecruitBlocked: false
                },
                refresh,
                undefined,
                dryRun);
            Ui.log("info", "Sending telegrams...");
        } catch (err) {
            Ui.log("error", `Failed to evaluate Template Recipient Language`
                            + ` string: ${err.message}`);
        }
    }

    /**
     * Cancels the current activity being performed by the app.
     */
    public cancel() {
        Ui.log("info", "Cancelling...");
        this._cancel = true;
        if (this._jobId !== "-1" && typeof this._nstg !== "undefined") {
            this._nstg.cancelJob(this._jobId);
        }
    }

    /**
     * Pauses the current activity.
     */
    public pause() {
        Ui.log("info", "Pausing...");
        this._pause = true;
        if (typeof this._nstg !== "undefined") {
            this._nstg.blockExistingTelegrams = true;
            this._nstg.blockNewTelegrams = true;
        }
    }

    /**
     * Resumes the current activity.
     */
    public unpause() {
        Ui.log("info", "Unpausing...");
        this._pause = false;
        if (typeof this._nstg !== "undefined") {
            this._nstg.blockExistingTelegrams = false;
            this._nstg.blockNewTelegrams = false;
        }
    }

    /**
     * Returns whether the app is paused.
     *
     * @return Whether the app is paused.
     */
    public isPaused() {
        return this._pause;
    }

    /**
     * Resets the app.
     */
    private reset() {
        this._nstg = undefined;
        this._cancel = false;
        this._pause = false;
        this._jobId = "-1";
    }
}
