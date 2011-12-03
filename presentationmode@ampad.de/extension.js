/* -*- mode: js2 - indent-tabs-mode: nil - js2-basic-offset: 4 -*- */
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GnomeSession = imports.misc.gnomeSession;
const UserMenu = imports.ui.userMenu;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const SessionIface = {
    name: "org.gnome.SessionManager",
    methods: [ 
    { name: "Inhibit", inSignature: "susu", outSignature: "u" },
    { name: "Uninhibit", inSignature: "u", outSignature: "" }
    ]
};
let SessionProxy = DBus.makeProxyClass(SessionIface);

// Put your extension initialization code here
function init(extensionMeta) {
    imports.gettext.bindtextdomain("gnome-shell-extension-presentationmode",
                           extensionMeta.path + "/locale");
    imports.gettext.textdomain("gnome-shell-extension-presentationmode");
}

function enable() {
    let userMenu = Main.panel._statusArea.userMenu;

    userMenu._itemSeparator = new PopupMenu.PopupSeparatorMenuItem();
    userMenu.menu.addMenuItem(userMenu._itemSeparator);
    userMenu._presentationswitch = new PopupMenu.PopupSwitchMenuItem(_("Presentation mode"), false);
    userMenu.menu.addMenuItem(userMenu._presentationswitch);
    userMenu._inhibit = undefined;
    userMenu._sessionProxy = new SessionProxy(DBus.session, 'org.gnome.SessionManager', '/org/gnome/SessionManager');

    userMenu._onInhibit = function(cookie) {
        userMenu._inhibit = cookie;
    };

    userMenu._presentationswitch.connect('toggled', Lang.bind(userMenu, function() {
        if(userMenu._inhibit) {
            userMenu._sessionProxy.UninhibitRemote(userMenu._inhibit);
            userMenu._inhibit = undefined;
            } else {
                try {
                    userMenu._sessionProxy.InhibitRemote("presentor",
                        0, 
                        "Presentation mode",
                        9,
                        Lang.bind(userMenu, userMenu._onInhibit));
                } catch(e) {
                    //
                }
            }
    }));
}

function disable() {
    let userMenu = Main.panel._statusArea.userMenu;

    userMenu._presentationswitch.destroy();
    userMenu._itemSeparator.destroy();
    if(userMenu._inhibit) {
        userMenu._sessionProxy.UninhibitRemote(userMenu._inhibit);
        userMenu._inhibit = undefined;
        }
}
