import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Crop
} from 'lucide-react';
import { Crop as CropType, CropType as CropTypeEnum, CROP_TYPE_LIST } from '@/types/crop';
import { useTranslation } from 'react-i18next';

interface AdvancedCropFilterProps {
  crops: CropType[];
  onFilterChange: (filteredCrops: CropType[]) => void;
  className?: string;
}

interface FilterState {
  search: string;
  cropType: string;
  profitStatus: 'all' | 'profitable' | 'loss';
  dateRange: [number, number];
  minProfit: number;
  maxProfit: number;
  showOnlyActive: boolean;
  sortBy: 'name' | 'profit' | 'date' | 'type';
  sortOrder: 'asc' | 'desc';
}

const AdvancedCropFilter: React.FC<AdvancedCropFilterProps> = ({ crops, onFilterChange, className }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    cropType: 'all',
    profitStatus: 'all',
    dateRange: [0, 365],
    minProfit: -100000,
    maxProfit: 100000,
    showOnlyActive: false,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const cropTypes = CROP_TYPE_LIST;

  const filteredCrops = useMemo(() => {
    let result = [...crops];

    // Search filter
    if (filters.search) {
      result = result.filter(crop =>
        crop.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        crop.type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Crop type filter
    if (filters.cropType !== 'all') {
      result = result.filter(crop => crop.type === filters.cropType);
    }

    // Profit status filter
    if (filters.profitStatus !== 'all') {
      result = result.filter(crop => {
        const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
        const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = income - expenses;
        
        if (filters.profitStatus === 'profitable') {
          return profit > 0;
        } else {
          return profit < 0;
        }
      });
    }

    // Profit range filter
    result = result.filter(crop => {
      const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
      const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const profit = income - expenses;
      return profit >= filters.minProfit && profit <= filters.maxProfit;
    });

    // Date range filter (days since sowing)
    const now = new Date();
    result = result.filter(crop => {
      const sowingDate = new Date(crop.sowingDate);
      const daysSinceSowing = Math.floor((now.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceSowing >= filters.dateRange[0] && daysSinceSowing <= filters.dateRange[1];
    });

    // Active crops filter (crops sown within last 365 days)
    if (filters.showOnlyActive) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      result = result.filter(crop => new Date(crop.sowingDate) >= oneYearAgo);
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'profit':
          const aIncome = a.income.reduce((sum, inc) => sum + inc.amount, 0);
          const aExpenses = a.expenses.reduce((sum, exp) => sum + exp.amount, 0);
          const bIncome = b.income.reduce((sum, inc) => sum + inc.amount, 0);
          const bExpenses = b.expenses.reduce((sum, exp) => sum + exp.amount, 0);
          aValue = aIncome - aExpenses;
          bValue = bIncome - bExpenses;
          break;
        case 'date':
          aValue = new Date(a.sowingDate).getTime();
          bValue = new Date(b.sowingDate).getTime();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [crops, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      cropType: 'all',
      profitStatus: 'all',
      dateRange: [0, 365],
      minProfit: -100000,
      maxProfit: 100000,
      showOnlyActive: false,
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.search || 
    filters.cropType !== 'all' || 
    filters.profitStatus !== 'all' || 
    filters.showOnlyActive ||
    filters.minProfit !== -100000 ||
    filters.maxProfit !== 100000;

  // Update parent component when filters change
  React.useEffect(() => {
    onFilterChange(filteredCrops);
  }, [filteredCrops, onFilterChange]);

  return (
    <div className={className}>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search crops by name or type..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="sorting">Sorting</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Crop Type</Label>
                    <Select
                      value={filters.cropType}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, cropType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {cropTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Profit Status</Label>
                    <Select
                      value={filters.profitStatus}
                      onValueChange={(value: 'all' | 'profitable' | 'loss') => 
                        setFilters(prev => ({ ...prev, profitStatus: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="profitable">Profitable</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-crops"
                    checked={filters.showOnlyActive}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showOnlyActive: checked }))}
                  />
                  <Label htmlFor="active-crops">Show only active crops (sown within last year)</Label>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div>
                  <Label>Profit Range (₹)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minProfit}
                      onChange={(e) => setFilters(prev => ({ ...prev, minProfit: Number(e.target.value) }))}
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxProfit}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxProfit: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Days Since Sowing: {filters.dateRange[0]} - {filters.dateRange[1]} days</Label>
                  <Slider
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as [number, number] }))}
                    max={365}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </TabsContent>

              <TabsContent value="sorting" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: 'name' | 'profit' | 'date' | 'type') => 
                        setFilters(prev => ({ ...prev, sortBy: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="profit">Profit</SelectItem>
                        <SelectItem value="date">Sowing Date</SelectItem>
                        <SelectItem value="type">Crop Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sort Order</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: 'asc' | 'desc') => 
                        setFilters(prev => ({ ...prev, sortOrder: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              />
            </Badge>
          )}
          {filters.cropType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.cropType}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, cropType: 'all' }))}
              />
            </Badge>
          )}
          {filters.profitStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.profitStatus === 'profitable' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {filters.profitStatus}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, profitStatus: 'all' }))}
              />
            </Badge>
          )}
          {filters.showOnlyActive && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crop className="w-3 h-3" />
              Active Only
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, showOnlyActive: false }))}
              />
            </Badge>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        Showing {filteredCrops.length} of {crops.length} crops
      </div>
    </div>
  );
};

export default AdvancedCropFilter; 