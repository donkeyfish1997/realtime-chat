import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Divider,
} from "@mui/material";
import { useAuth } from "~/context/AuthContext";
import BasicInfoForm from "~/components/Auth/Profile/BasicInfoForm";
import PasswordChangeForm from "~/components/Auth/Profile/PasswordChangeForm";
import EmailChangeForm from "~/components/Auth/Profile/EmailChangeForm";

// --- TabPanel 元件 (MUI 範例，用於切換內容) ---
function CustomTabPanel(props: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const { user } = useAuth();

  const handleTabChange = (event: any, newValue: 0 | 1 | 2) => {
    setActiveTab(newValue);
  };

  return (
    // <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
    <Paper
      elevation={3}
      sx={{
        p: 4,
        minWidth: "600px",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        prifile setting
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* --- 標籤頁導航 --- */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="profile tabs"
        >
          <Tab label="profile" />
          <Tab label="change password" />
          <Tab label="change email" />
        </Tabs>
      </Box>

      {/* --- 標籤頁內容 1: 基本資料 --- */}
      <CustomTabPanel value={activeTab} index={0}>
        {user && <BasicInfoForm user={user} />}
      </CustomTabPanel>

      {/* --- 標籤頁內容 2: 更改密碼 --- */}
      <CustomTabPanel value={activeTab} index={1}>
        <PasswordChangeForm />
      </CustomTabPanel>
      <CustomTabPanel value={activeTab} index={2}>
        <EmailChangeForm />
      </CustomTabPanel>
    </Paper>
    // </Container>
  );
};

export default ProfilePage;
