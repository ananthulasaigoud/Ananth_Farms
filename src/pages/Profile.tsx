import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  LogOut, 
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Bell,
  Key,
  HelpCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCropStore } from "@/store/supabaseCropStore";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useAuth();
  const { t } = useTranslation();
  const { colorScheme, setColorScheme, isDark, theme, setTheme } = useTheme();
  const { crops, landExpenses, refreshCropData } = useCropStore();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: user?.user_metadata?.display_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    farmName: user?.user_metadata?.farm_name || "AnanthFarms",
    location: user?.user_metadata?.location || "",
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    autoBackup: true,
    dataSync: true,
    darkMode: isDark,
    language: "en",
    currency: "INR",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.user_metadata?.display_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        farmName: user.user_metadata?.farm_name || "AnanthFarms",
        location: user.user_metadata?.location || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await updateProfile({
        display_name: profileData.displayName,
        phone: profileData.phone,
        farm_name: profileData.farmName,
        location: profileData.location,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleDataExport = async () => {
    try {
      const exportData = {
        crops,
        landExpenses,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farmlog-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleDataImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate import data structure
      if (!data.crops || !data.landExpenses) {
        throw new Error("Invalid data format");
      }
      
      // TODO: Implement data import logic
      toast.success("Data import feature coming soon!");
    } catch (error) {
      toast.error("Failed to import data");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion logic
      toast.success("Account deletion feature coming soon!");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const getColorSchemeClasses = () => {
    const colorSchemes = {
      green: "bg-green-50 dark:bg-green-950",
      blue: "bg-blue-50 dark:bg-blue-950", 
      purple: "bg-purple-50 dark:bg-purple-950",
      orange: "bg-orange-50 dark:bg-orange-950",
      red: "bg-red-50 dark:bg-red-950"
    };
    return colorSchemes[colorScheme];
  };

  const getStats = () => {
    const totalCrops = crops.length;
    const totalIncome = crops.reduce((sum, crop) => sum + crop.income.reduce((t, i) => t + i.amount, 0), 0);
    const totalExpenses = crops.reduce((sum, crop) => sum + crop.expenses.reduce((t, e) => t + e.amount, 0), 0);
    const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpenses - totalLandExpenses;
    
    return { totalCrops, totalIncome, totalExpenses, totalLandExpenses, netProfit };
  };

  const stats = getStats();

  return (
    <div className={`min-h-screen ${getColorSchemeClasses()}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-green-950/80 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Profile</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">👤</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
                  Profile & Settings
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
          {/* Mobile breadcrumb */}
          <div className="sm:hidden pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-green-600 dark:text-green-400 font-medium">Profile</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🌾</span>
                  </div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    {profileData.farmName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profileData.displayName || user?.email}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                    <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last login:</span>
                    <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farm Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-lg">📊</span>
                  Farm Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="font-semibold text-green-600 dark:text-green-400">{stats.totalCrops}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Crops</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">₹{stats.totalIncome.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Income</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="font-semibold text-red-600 dark:text-red-400">₹{stats.totalExpenses.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Expenses</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <div className={`font-semibold ${stats.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ₹{Math.abs(stats.netProfit).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{stats.netProfit >= 0 ? 'Profit' : 'Loss'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Data</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            {t('actions.cancel')}
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            {t('actions.edit')}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input
                          id="farmName"
                          value={profileData.farmName}
                          onChange={(e) => setProfileData({ ...profileData, farmName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditing}
                          placeholder="City, State, Country"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          {t('actions.cancel')}
                        </Button>
                        <Button
                          onClick={handleProfileUpdate}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {t('actions.saving')}
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {t('actions.save_changes')}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      App Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Theme Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Appearance
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="themeMode">Theme</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Choose between light, dark, or auto mode
                            </p>
                          </div>
                          <Select
                            value={theme}
                            onValueChange={setTheme}
                          >
                            <SelectTrigger className="w-32" id="themeMode">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="auto">Auto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="colorScheme">Color Scheme</Label>
                          <Select value={colorScheme} onValueChange={setColorScheme}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="orange">Orange</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Language Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Language & Region
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="hi">Hindi</SelectItem>
                              <SelectItem value="ta">Tamil</SelectItem>
                              <SelectItem value="te">Telugu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                              <SelectItem value="USD">US Dollar ($)</SelectItem>
                              <SelectItem value="EUR">Euro (€)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="notifications">Push Notifications</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive notifications for important updates
                            </p>
                          </div>
                          <Switch
                            id="notifications"
                            checked={settings.notifications}
                            onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoBackup">Auto Backup</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Automatically backup your data
                            </p>
                          </div>
                          <Switch
                            id="autoBackup"
                            checked={settings.autoBackup}
                            onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="dataSync">Data Sync</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Sync data across devices
                            </p>
                          </div>
                          <Switch
                            id="dataSync"
                            checked={settings.dataSync}
                            onCheckedChange={(checked) => setSettings({ ...settings, dataSync: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">App Version:</span>
                        <span>1.0.0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Developer:</span>
                        <span>Ananth</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Contact:</span>
                        <a href="mailto:support@ananthfarms.com" className="text-blue-600 underline">support@ananthfarms.com</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Help:</span>
                        <a href="https://github.com/ananthfarms/farmlog-profit-tracker#readme" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">User Guide</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Password Change */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Password
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <Button className="w-full sm:w-auto">
                          <Key className="w-4 h-4 mr-2" />
                          Change Password
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Account Actions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Account Actions
                      </h3>
                      <div className="space-y-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50">
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Sign Out</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to sign out? You'll need to sign in again to access your data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleSignOut}>
                                Sign Out
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Data Export */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Data
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Download a backup of all your farm data including crops, expenses, and income records.
                      </p>
                      <Button onClick={handleDataExport} className="w-full sm:w-auto">
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                    </div>

                    <Separator />

                    {/* Data Import */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import Data
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Import previously exported data. This will merge with your existing data.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="importFile">Select File</Label>
                        <Input
                          id="importFile"
                          type="file"
                          accept=".json"
                          onChange={handleDataImport}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Data Refresh */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-lg">🔄</span>
                        Data Sync
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manually refresh your data from the server to ensure you have the latest information.
                      </p>
                      <Button 
                        onClick={refreshCropData} 
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <span className="text-lg mr-2">🔄</span>
                        Refresh Data
                      </Button>
                    </div>

                    <Separator />

                    {/* Data Statistics */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Data Statistics
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-semibold">{stats.totalCrops}</div>
                          <div className="text-gray-600 dark:text-gray-400">Total Crops</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-semibold">{landExpenses.length}</div>
                          <div className="text-gray-600 dark:text-gray-400">Land Expenses</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-semibold">
                            {crops.reduce((sum, crop) => sum + crop.expenses.length, 0)}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">Total Expenses</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-semibold">
                            {crops.reduce((sum, crop) => sum + crop.income.length, 0)}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">Total Income</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile; 