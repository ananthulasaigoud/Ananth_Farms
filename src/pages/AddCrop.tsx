import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Sprout, Calendar, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCropStore } from "@/store/supabaseCropStore";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { CropType, CROP_TYPE_LIST } from "@/types/crop";
import { toast } from "sonner";

const AddCrop = () => {
  const navigate = useNavigate();
  const { addCrop } = useCropStore();
  const { t } = useTranslation();
  const { colorScheme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '' as CropType,
    landArea: '',
    landUnit: 'acres' as 'acres' | 'hectares',
    sowingDate: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const landUnits = ['acres', 'hectares'] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a crop name");
      return;
    }
    if (!formData.type) {
      toast.error("Please select a crop type");
      return;
    }
    if (!formData.landArea || parseFloat(formData.landArea) <= 0) {
      toast.error("Please enter a valid land area");
      return;
    }
    if (!formData.sowingDate) {
      toast.error("Please select a sowing date");
      return;
    }

    setLoading(true);

    try {
      await addCrop({
        name: formData.name.trim(),
        type: formData.type,
        landArea: parseFloat(formData.landArea),
        landUnit: formData.landUnit,
        sowingDate: formData.sowingDate,
      });

      toast.success(`Crop "${formData.name}" added successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        type: '' as CropType,
        landArea: '',
        landUnit: 'acres' as 'acres' | 'hectares',
        sowingDate: '',
        description: '',
      });
      
      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      toast.error("Failed to add crop. Please try again.");
    } finally {
      setLoading(false);
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

  return (
    <div className={`min-h-screen ${getColorSchemeClasses()}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-green-950/80 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="shrink-0"
              >
                <span className="text-lg mr-2">👤</span>
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Add Crop</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">🌾</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
                  Add New Crop
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Create a new crop record to start tracking
                </p>
              </div>
            </div>
          </div>
          {/* Mobile breadcrumb */}
          <div className="sm:hidden pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-green-600 dark:text-green-400 font-medium">Add Crop</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
                  Crop Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Crop Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">🌾</span>
                      Crop Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Cotton Field 1, Wheat Plot A"
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>

                  {/* Crop Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="type" className="text-sm font-medium">Crop Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as CropType })}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROP_TYPE_LIST.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Land Area and Unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="landArea" className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Land Area
                      </Label>
                      <Input
                        id="landArea"
                        type="number"
                        step="0.01"
                        value={formData.landArea}
                        onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                        placeholder="0.00"
                        required
                        className="h-10 sm:h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="landUnit" className="text-sm font-medium">Unit</Label>
                      <Select value={formData.landUnit} onValueChange={(value) => setFormData({ ...formData, landUnit: value as 'acres' | 'hectares' })}>
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {landUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {t(unit)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sowing Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="sowingDate" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Sowing Date
                    </Label>
                    <Input
                      id="sowingDate"
                      type="date"
                      value={formData.sowingDate}
                      onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add any additional notes about this crop..."
                      className="min-h-[80px] sm:min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/')} 
                      className="w-full sm:w-auto h-10 sm:h-11"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto h-10 sm:h-11 bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding Crop...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Crop
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Help & Tips */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Tips Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Use descriptive names like "Cotton Field 1" or "Wheat Plot A"</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Select the correct crop type for better expense categorization</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Accurate land area helps in calculating per-acre costs</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Add descriptions for future reference</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full h-10 sm:h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/land-expenses')}
                  className="w-full h-10 sm:h-11"
                >
                  <span className="text-lg mr-2">🏗️</span>
                  Manage Land Expenses
                </Button>
              </CardContent>
            </Card>

            {/* Crop Types Info */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">🌱 Crop Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    Available crop types include:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {CROP_TYPE_LIST.slice(0, 8).map((type) => (
                      <span key={type} className="text-gray-700 dark:text-gray-300">• {type}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Choose "Other" for crops not listed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddCrop; 