import Logger from ".";
import LocalStore from "./store/local-store";
import KrashReporter from "./reporter/krash-reporter";
import Tabs from "./tabs";
import Popup from "../popup";

const HEARTBEAT_KEY = "heartbeat";
const HEARTBEAT_THRESHOLD = 1000 * 10;

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
                    <a class="popup-btn" href="${report.url}" target="_blank">Details</a>
                    <a class="popup-close popup-btn">Close</a>
                </div>
            `);
    
            let close = popup.el.querySelector(".popup-close") as HTMLElement;
            close.onclick = () => popup.hide(true);
            popup.display();
        }
    }

    const heartbeatInterval = setInterval(() => localStorage.setItem(HEARTBEAT_KEY, Date.now().toString()), 1000);
    const currentHeartbeat = Number(localStorage.getItem(HEARTBEAT_KEY) || 0);
    const diff = Date.now() - currentHeartbeat;

    Tabs.increment();
    Logger.prefix = `[tab ${Tabs.count}]`;
    Logger.store = new LocalStore();
    Logger.reporter = new KrashReporter({ version: fix3p.version });

    window.onerror = (message: string) => Logger.error(`unhandled error: ${message}`, fix3p.session.filename);
    window.onunload = () => {
        Tabs.decrement();
        clearInterval(heartbeatInterval);

        if(Tabs.count == 0) {
            Logger.clear();
        } else {
            Logger.info("closed tab");
        }
    }
    
    if(Logger.count > 0 && (Tabs.count == 1 || diff > HEARTBEAT_THRESHOLD)) {
        if(Tabs.count > 1) {
            Tabs.count = 1;
            Logger.prefix = `[tab ${Tabs.count}]`;
        }

        Logger.info("crash recovery started");
        sendCrashReport();
    }
}


