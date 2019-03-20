import Logger from ".";
import LocalStore from "./store/local-store";
import KrashReporter from "./reporter/krash-reporter";
import Popup from "../popup";

export default function setup(fix3p) {
    async function sendCrashReport() {
        if(!fix3p.reporting) return;
        
        Logger.info("uploading crash report");
        let report = await Logger.report();
    
        if(report) {
            let popup = new Popup(`
                <h3>Crash Recovery</h3>
                <p>FiX3P just recovered from a crash.</p>
                <div class="popup-btns">
                    <a class="popup-btn" href="${report.url}">Details</a>
                    <a class="popup-close popup-btn">Close</a>
                </div>
            `);
    
            let close = popup.el.querySelector(".popup-close") as HTMLElement;
            close.onclick = () => popup.hide(true);
            popup.display();
        }
    }

    Logger.store = new LocalStore();
    Logger.reporter = new KrashReporter({ version: fix3p.version });

    window.onerror = (message: string) => Logger.error(`unhandled error: ${message}`, fix3p.session.filename);
    window.onunload = () => Logger.clear();

    if(Logger.count > 0) {
        Logger.info("crash recovery started");
        sendCrashReport();
    }
}


