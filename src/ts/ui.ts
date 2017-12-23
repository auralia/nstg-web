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
import App from "./app";
import * as $ from "jquery";
import {NsTgApi} from "nstg";
import {TelegramType} from "nsapi";

/**
 * Contains the application's UI logic.
 */
export default class Ui {
    private readonly _app: App;

    /**
     * Initializes a new instance of the Ui class.
     */
    constructor() {
        this._app = new App();
    }

    /**
     * Initializes the application's UI.
     */
    public init(): void {
        // Initialize auto save checkbox
        let autoLoadSave = false;
        try {
            const autoLoadSaveInput = $("#autoLoadSave");
            const autoLoadSaveRaw = localStorage.getItem("autoLoadSave");
            autoLoadSave = autoLoadSaveRaw !== null
                ? autoLoadSaveRaw === "true" : true;
            autoLoadSaveInput.prop("checked", autoLoadSave);
            autoLoadSaveInput.on("click", () => {
                localStorage.setItem(
                    "autoLoadSave",
                    String(autoLoadSaveInput.is(":checked")));
            });
        } catch {
            // No local storage
        }

        // Initialize tabs
        $("#navbar").find("a").click((e) => {
            e.preventDefault();
            $(e.currentTarget).tab("show");
        });

        // Add handlers
        $("#loadButton").on("click", () => Ui.handleLoad());
        $("#saveButton").on("click", () => Ui.handleSave());
        $("#startButton").on("click", () => {
            this.handleStart().catch((err) => {
                console.error(err);
            });
        });
        $("#pauseButton").on("click", () => this.handlePause());
        $("#cancelButton").on("click", () => this.handleCancel());
        $("#clearButton").on("click", () => Ui.handleClear());
        $(window).on("unload", () => Ui.handleClose());

        // Load configuration
        if (autoLoadSave) {
            Ui.handleLoad();
        }
    }

    /**
     * Logs a message to the log text area.
     *
     * @param type The type of log message (e.g. info, error, etc.)
     * @param message The log message.
     */
    public static log(type: string, message: string) {
        const logElement = $("#log");
        const text = logElement.html();

        message = type + ": " + message;
        if (text !== "") {
            message = "<br>" + message;
        }
        logElement.html(text + message);

        if ($("#scrollToBottom").is(":checked")) {
            logElement.scrollTop(
                Number(logElement.prop("scrollHeight")));
        }
    }

    /**
     * Toggles the application's UI depending on whether the application is
     * currently running.
     *
     * @param running Whether the application is currently running.
     */
    static toggleUi(running: boolean): void {
        const config = $("#configuration");
        config.find("input").prop("disabled", running);
        config.find("textarea").prop("disabled", running);
        config.find("button").prop("disabled", running);

        $("#pauseButton").prop("disabled", !running);
        $("#cancelButton").prop("disabled", !running);
    }

    /**
     * Shows an alert.
     *
     * @param id The ID of the alert.
     * @param message The message of the alert.
     * @param cssClass The CSS class of the alert.
     * @param containerId The ID of the container of the alert.
     */
    private static showAlert(id: string, message: string, cssClass: string,
                             containerId: string): void {
        if ($("#" + id).length === 0) {
            $("<div>")
                .attr("id", id)
                .addClass("alert " + cssClass)
                .append(message)
                .appendTo($("#" + containerId));
        }
    }

    /**
     * Shows a validation alert.
     *
     * @param id The ID of the alert.
     * @param message The message of the alert.
     * @param formGroupId The ID of the form group of the alert.
     */
    private static showValidationAlert(id: string, message: string,
                                       formGroupId: string): void {
        if ($("#" + id).length === 0) {
            $("#" + formGroupId).addClass("has-error");
            Ui.showAlert(id,
                         message,
                         "alert-danger additional-top-spacing",
                         formGroupId);
        }
    }

    /**
     * Hides a validation alert.
     *
     * @param id The ID of the alert.
     * @param formGroupId The ID of the form group of the alert.
     */
    private static hideValidationAlert(id: string, formGroupId: string): void {
        $("#" + id).remove();
        $("#" + formGroupId).removeClass("has-error");
    }

    /**
     * Handler for the load configuration button.
     */
    private static handleLoad(): void {
        try {
            const userAgent = localStorage.getItem("userAgent");
            if (userAgent !== null) {
                $("#userAgent").val(userAgent);
            }
            const clientKey = localStorage.getItem("clientKey");
            if (clientKey !== null) {
                $("#clientKey").val(clientKey);
            }
            const rateLimit = localStorage.getItem("rateLimit");
            switch (rateLimit) {
                case "0":
                    $("#rateLimitRecruitment").prop(
                        "checked",
                        true);
                    break;
                case "1":
                    $("#rateLimitNonRecruitment").prop(
                        "checked",
                        true);
                    break;
            }
            const telegramId = localStorage.getItem("telegramId");
            if (telegramId !== null) {
                $("#telegramId").val(telegramId);
            }
            const secretKey = localStorage.getItem("secretKey");
            if (secretKey !== null) {
                $("#secretKey").val(secretKey);
            }
            const recipients = localStorage.getItem("recipients");
            if (recipients !== null) {
                $("#recipients").val(recipients);
            }
            const continuous = localStorage.getItem("continuous");
            if (continuous != null) {
                $("#continuous").prop(
                    "checked",
                    continuous === "true");
            }
            const dryRun = localStorage.getItem("dryRun");
            if (dryRun != null) {
                $("#dryRun").prop(
                    "checked",
                    dryRun === "true");
            }
            const autoAddPastRecipients = localStorage.getItem(
                "autoAddPastRecipients");
            if (autoAddPastRecipients != null) {
                $("#autoAddPastRecipients").prop(
                    "checked",
                    autoAddPastRecipients === "true");
            }
            const verbose = localStorage.getItem("verbose");
            if (verbose != null) {
                $("#verbose").prop(
                    "checked",
                    verbose === "true");
            }
        } catch {
            // No local storage
        }
    }

    /**
     * Handler for the save configuration button.
     */
    private static handleSave(): void {
        try {
            localStorage.setItem("userAgent",
                                 String($("#userAgent").val()));
            localStorage.setItem("clientKey",
                                 String($("#clientKey").val()));
            localStorage.setItem("rateLimit",
                                 String(Ui.getTelegramType()));
            localStorage.setItem("telegramId",
                                 String($("#telegramId").val()));
            localStorage.setItem("secretKey",
                                 String($("#secretKey").val()));
            localStorage.setItem("recipients",
                                 String($("#recipients").val()));
            localStorage.setItem(
                "continuous",
                String($("#continuous").is(":checked")));
            localStorage.setItem("dryRun",
                                 String($("#dryRun").is(":checked")));
            localStorage.setItem(
                "autoAddPastRecipients",
                String($("#autoAddPastRecipients").is(":checked")));
            localStorage.setItem("verbose",
                                 String($("#verbose").is(":checked")));
        } catch {
            // No local storage
        }
    }

    /**
     * Handler for the start button.
     */
    private async handleStart(): Promise<void> {
        const userAgentInput = $("#userAgent");
        const clientKeyInput = $("#clientKey");
        const telegramIdInput = $("#telegramId");
        const secretKeyInput = $("#secretKey");
        const recipientsInput = $("#recipients");
        const continuousInput = $("#continuous");
        const dryRunInput = $("#dryRun");
        const verboseInput = $("#verbose");

        let passValidation = true;

        Ui.hideValidationAlert("userAgentValidationAlert",
                               "userAgentFormGroup");
        if (userAgentInput.val() === "") {
            Ui.showValidationAlert("userAgentValidationAlert",
                                   "You must specify a user agent.",
                                   "userAgentFormGroup");
            passValidation = false;
        }

        Ui.hideValidationAlert("clientKeyValidationAlert",
                               "clientKeyFormGroup");
        if (userAgentInput.val() === "") {
            Ui.showValidationAlert("clientKeyValidationAlert",
                                   "You must specify a client key.",
                                   "clientKeyFormGroup");
            passValidation = false;
        }

        Ui.hideValidationAlert("telegramIdValidationAlert",
                               "telegramIdFormGroup");
        if (userAgentInput.val() === "") {
            Ui.showValidationAlert("telegramIdValidationAlert",
                                   "You must specify a telegram ID.",
                                   "telegramIdFormGroup");
            passValidation = false;
        }

        Ui.hideValidationAlert("secretKeyValidationAlert",
                               "secretKeyFormGroup");
        if (userAgentInput.val() === "") {
            Ui.showValidationAlert("secretKeyValidationAlert",
                                   "You must specify a secret key.",
                                   "secretKeyFormGroup");
            passValidation = false;
        }

        Ui.hideValidationAlert("secretKeyValidationAlert",
                               "secretKeyFormGroup");
        if (userAgentInput.val() === "") {
            Ui.showValidationAlert("secretKeyValidationAlert",
                                   "You must specify a secret key.",
                                   "secretKeyFormGroup");
            passValidation = false;
        }

        Ui.hideValidationAlert("recipientsValidationAlert",
                               "recipientsFormGroup");
        if (recipientsInput.val() === "") {
            Ui.showValidationAlert("recipientsValidationAlert",
                                   "You must specify some recipients.",
                                   "recipientsFormGroup");
            passValidation = false;
        }
        try {
            NsTgApi.validateTrl(String(recipientsInput.val()));
        } catch (err) {
            Ui.showValidationAlert("recipientsValidationAlert",
                `Error parsing Template Recipient Language`
                + ` string: ${err.message}`,
                                   "recipientsFormGroup");
            passValidation = false;
        }

        if (!passValidation) {
            return;
        }

        const userAgent = String(userAgentInput.val());
        const clientKey = String(clientKeyInput.val());
        const rateLimit: TelegramType = Ui.getTelegramType();
        const telegramId = String(telegramIdInput.val());
        const secretKey = String(secretKeyInput.val());
        const recipients = String(recipientsInput.val());
        const continuous = continuousInput.is(":checked");
        const dryRun = dryRunInput.is(":checked");
        const verbose = verboseInput.is(":checked");

        Ui.toggleUi(true);
        $("#navbar").find("a[href='#status']").tab("show");

        await this._app.start(
            userAgent, clientKey, recipients, telegramId, secretKey, rateLimit,
            dryRun, continuous, verbose);
    }

    /**
     * Handler fot the pause button.
     */
    private handlePause(): void {
        if (this._app.isPaused()) {
            this._app.unpause();
            $("#pauseButton").text("Pause");
        } else {
            this._app.pause();
            $("#pauseButton").text("Resume");
        }
    }

    /**
     * Handler fot the cancel button.
     */
    private handleCancel(): void {
        const pauseButton = $("#pauseButton");
        pauseButton.text("Pause");
        pauseButton.prop("disabled", true);
        $("#cancelButton").prop("disabled", true);
        this._app.cancel();
    }

    /**
     * Handler fot the clear button.
     */
    private static handleClear(): void {
        $("#log").html("");
    }

    /**
     * Handler called when a telegram is sent and autoAddPastRecipients is true.
     */
    public static handleTgSuccess(recipient: string): void {
        if ($("#autoAddPastRecipients").is(":checked")) {
            const recipientsInput = $("#recipients");
            let trl = String(recipientsInput.val());
            trl += `\n-nations [${recipient}];`;
            recipientsInput.val(trl);
        }
    }

    /**
     * Handler called when application finishes running.
     */
    public static handleFinish(): void {
        Ui.toggleUi(false);
        $("#restoreButton").prop("disabled", true);
    }

    /**
     * Handler called when tab is closed.
     */
    private static handleClose(): void {
        if ($("#autoLoadSave").is(":checked")) {
            Ui.handleSave();
        }
    }

    /**
     * Gets the selected telegram type.
     */
    private static getTelegramType(): TelegramType {
        const rateLimitRecruitmentInput = $("#rateLimitRecruitment");
        const rateLimitNonRecruitmentInput = $("#rateLimitNonRecruitment");
        if (rateLimitRecruitmentInput.is(":checked")) {
            return TelegramType.Recruitment;
        } else if (rateLimitNonRecruitmentInput.is(":checked")) {
            return TelegramType.NonRecruitment;
        } else {
            throw new Error("No rate limit is checked");
        }
    }
}
