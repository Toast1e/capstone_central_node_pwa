"use client";

// React and NextJS
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// UI Libraries mostly Ant design libraries
import { Avatar, Button, Card, Flex, Input, Segmented, Select, Space, Typography, theme } from "antd";
import { RiLogoutBoxRLine, RiMoonLine, RiRouterLine, RiSmartphoneLine, RiSunLine } from "@remixicon/react";

// Our own contexts
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";

// ------ Setting options ------
// the 3 choices i.e light or dark or device settings
const themeOptions = [
    { label: "Light", value: "light", icon: <RiSunLine size={16} /> },
    { label: "Dark", value: "dark", icon: <RiMoonLine size={16} /> },
    { label: "Auto", value: "system", icon: <RiSmartphoneLine size={16} /> },
];

// time interval options
const intervalOptions = [5, 10, 15, 30, 60].map((minutes) => ({
    label: `Every ${minutes} minutes`,
    value: minutes,
}));

export default function Profile() {
    // theme colours from themeConfig.js
    const { token } = theme.useToken();

    // app settings shared with the rest of the app (SettingsContext.jsx)
    const { username, themeMode, readingInterval, updateSetting } = useSettings();

    // logout() forgets who is signed in, then we send them to the login page ourselves
    const { logout } = useAuth();
    const router = useRouter();

    function handleLogout() {
        logout();
        // replace instead of push: the Back button won't return to the app after logging out
        router.replace("/login");
    }

    // ------ Rename the central node ------
    // what's typed in the box, kept separate so typing doesn't rename anything until Saved
    const [newName, setNewName] = useState(username);

    // when the saved name loads (or is saved), show it in the box
    useEffect(() => {
        setNewName(username);
    }, [username]);

    // trim() removes spaces at the start and end, so "  " doesn't count as a name
    const trimmedName = newName.trim();
    // only allow Save when there's a name and it's different from the current one
    const nameChanged = trimmedName !== "" && trimmedName !== username;

    return (
        <Flex vertical gap="large">
            {/* Page title */}
            <Typography.Title level={2} style={{ margin: 0 }}>Profile</Typography.Title>

            {/* who is signed in: the central node is the account */}
            <Card>
                <Flex align="center" gap="middle">
                    <Avatar
                        size={56}
                        icon={<RiRouterLine size={28} />}
                        style={{ background: token.colorPrimaryBg, color: token.colorPrimary, flexShrink: 0 }}
                    />
                    <Flex vertical>
                        <Typography.Title level={4} style={{ margin: 0 }}>{username}</Typography.Title>
                        <Typography.Text type="secondary">Signed in on this phone</Typography.Text>
                    </Flex>
                </Flex>
            </Card>

            {/* light / dark mode */}
            <Card size="small" title="Appearance">
                <Flex vertical gap="small">
                    {/* block = stretch to the full width of the card */}
                    <Segmented
                        options={themeOptions}
                        value={themeMode}
                        onChange={(value) => updateSetting("themeMode", value)}
                        block
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Auto follows your device's light or dark setting.
                    </Typography.Text>
                </Flex>
            </Card>

            {/* central node settings */}
            <Card size="small" title="Central node settings">
                <Flex vertical gap="large">
                    {/* rename the central node */}
                    <Flex vertical gap="small">
                        <Typography.Text strong>Name</Typography.Text>
                        {/* Space.Compact joins the box and the button into one control */}
                        <Space.Compact block>
                            <Input
                                value={newName}
                                onChange={(event) => setNewName(event.target.value)}
                                // Enter on the keyboard saves too
                                onPressEnter={() => nameChanged && updateSetting("username", trimmedName)}
                                maxLength={30}
                                aria-label="Central node name"
                            />
                            <Button type="primary" disabled={!nameChanged} onClick={() => updateSetting("username", trimmedName)}>
                                Save
                            </Button>
                        </Space.Compact>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Shown in the top bar and on the Home page.
                        </Typography.Text>
                    </Flex>

                    {/* how often leaf nodes send readings */}
                    <Flex vertical gap="small">
                        <Typography.Text strong>Reading interval</Typography.Text>
                        <Select
                            options={intervalOptions}
                            value={readingInterval}
                            onChange={(value) => updateSetting("readingInterval", value)}
                            aria-label="Reading interval"
                        />
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            How often each leaf node's readings are updated.
                        </Typography.Text>
                    </Flex>
                </Flex>
            </Card>

            {/* sign out of the central node */}
            <Button danger size="large" block icon={<RiLogoutBoxRLine size={18} />} onClick={handleLogout}>
                Log out
            </Button>
        </Flex>
    );
}