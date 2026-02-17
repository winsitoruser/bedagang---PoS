import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Search, Plus, Edit, Trash2, ChefHat, Clock,
  Users, DollarSign, Package, BookOpen, Eye
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: string[];
  cost: number;
  price: number;
  image?: string;
}

const RecipeManagementPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Mock data
  useEffect(() => {
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        name: 'Nasi Goreng Spesial',
        category: 'Main Course',
        description: 'Nasi goreng dengan telur, ayam, dan sayuran',
        prepTime: 10,
        cookTime: 15,
        servings: 1,
        difficulty: 'easy',
        cost: 12000,
        price: 35000,
        ingredients: [
          { id: '1', name: 'Nasi Putih', quantity: 300, unit: 'gram', cost: 3000 },
          { id: '2', name: 'Ayam Fillet', quantity: 100, unit: 'gram', cost: 5000 },
          { id: '3', name: 'Telur', quantity: 1, unit: 'butir', cost: 2000 },
          { id: '4', name: 'Bawang Merah', quantity: 3, unit: 'siung', cost: 500 },
          { id: '5', name: 'Kecap Manis', quantity: 2, unit: 'sdm', cost: 1500 }
        ],
        instructions: [
          'Panaskan minyak dalam wajan',
          'Tumis bawang merah hingga harum',
          'Masukkan ayam, masak hingga matang',
          'Masukkan nasi, aduk rata',
          'Tambahkan kecap dan bumbu',
          'Buat lubang di tengah, masukkan telur',
          'Aduk semua bahan hingga tercampur rata',
          'Sajikan dengan kerupuk dan acar'
        ]
      },
      {
        id: '2',
        name: 'Soto Ayam',
        category: 'Soup',
        description: 'Soto ayam kuning dengan kuah gurih',
        prepTime: 20,
        cookTime: 45,
        servings: 1,
        difficulty: 'medium',
        cost: 15000,
        price: 40000,
        ingredients: [
          { id: '1', name: 'Ayam', quantity: 200, unit: 'gram', cost: 8000 },
          { id: '2', name: 'Kunyit', quantity: 2, unit: 'cm', cost: 500 },
          { id: '3', name: 'Serai', quantity: 1, unit: 'batang', cost: 300 },
          { id: '4', name: 'Daun Jeruk', quantity: 3, unit: 'lembar', cost: 200 },
          { id: '5', name: 'Soun', quantity: 50, unit: 'gram', cost: 2000 }
        ],
        instructions: [
          'Rebus ayam dengan bumbu halus',
          'Angkat ayam, suwir-suwir',
          'Saring kaldu',
          'Siapkan mangkuk saji',
          'Masukkan soun, tauge, ayam',
          'Tuang kuah panas',
          'Beri pelengkap: bawang goreng, seledri, jeruk nipis'
        ]
      },
      {
        id: '3',
        name: 'Ayam Bakar Madu',
        category: 'Main Course',
        description: 'Ayam bakar dengan saus madu pedas manis',
        prepTime: 30,
        cookTime: 40,
        servings: 1,
        difficulty: 'medium',
        cost: 18000,
        price: 50000,
        ingredients: [
          { id: '1', name: 'Ayam Kampung', quantity: 300, unit: 'gram', cost: 12000 },
          { id: '2', name: 'Madu', quantity: 3, unit: 'sdm', cost: 3000 },
          { id: '3', name: 'Kecap Manis', quantity: 2, unit: 'sdm', cost: 1000 },
          { id: '4', name: 'Bawang Putih', quantity: 5, unit: 'siung', cost: 1000 },
          { id: '5', name: 'Cabai Merah', quantity: 3, unit: 'buah', cost: 1000 }
        ],
        instructions: [
          'Marinasi ayam dengan bumbu halus selama 30 menit',
          'Bakar ayam di atas bara api',
          'Olesi dengan saus madu secara berkala',
          'Bakar hingga matang dan kecoklatan',
          'Sajikan dengan nasi hangat dan lalapan'
        ]
      }
    ];
    setRecipes(mockRecipes);
  }, []);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      hard: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      easy: 'Mudah',
      medium: 'Sedang',
      hard: 'Sulit'
    };
    return (
      <Badge className={`${styles[difficulty as keyof typeof styles]} border`}>
        {labels[difficulty as keyof typeof labels]}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateProfit = (price: number, cost: number) => {
    return ((price - cost) / price * 100).toFixed(0);
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Manajemen Resep | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manajemen Resep</h1>
              <p className="text-gray-600">Kelola resep dan komposisi menu</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Resep
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Resep</p>
                  <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Prep Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(recipes.reduce((acc, r) => acc + r.prepTime, 0) / recipes.length)} min
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(recipes.reduce((acc, r) => acc + r.cost, 0) / recipes.length)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Margin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(recipes.reduce((acc, r) => acc + ((r.price - r.cost) / r.price * 100), 0) / recipes.length)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari resep berdasarkan nama atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{recipe.name}</CardTitle>
                    <p className="text-sm text-gray-600">{recipe.category}</p>
                  </div>
                  {getDifficultyBadge(recipe.difficulty)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-xs">Prep + Cook</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {recipe.prepTime + recipe.cookTime} min
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-xs">Servings</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {recipe.servings} porsi
                    </p>
                  </div>
                </div>

                <div className="bg-sky-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Cost</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(recipe.cost)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Price</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(recipe.price)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-sky-100">
                    <span className="text-xs font-medium text-gray-700">Profit Margin</span>
                    <span className="text-sm font-bold text-green-600">
                      {calculateProfit(recipe.price, recipe.cost)}%
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Ingredients ({recipe.ingredients.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 3).map((ing) => (
                      <Badge key={ing.id} variant="outline" className="text-xs">
                        {ing.name}
                      </Badge>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.ingredients.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recipe Detail Dialog */}
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedRecipe?.name}</DialogTitle>
            </DialogHeader>
            {selectedRecipe && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    {getDifficultyBadge(selectedRecipe.difficulty)}
                    <Badge variant="outline">{selectedRecipe.category}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Prep Time</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.prepTime} min</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Cook Time</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.cookTime} min</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Servings</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.servings}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                  <div className="space-y-2">
                    {selectedRecipe.ingredients.map((ing) => (
                      <div key={ing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{ing.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {ing.quantity} {ing.unit}
                          </p>
                          <p className="text-xs text-gray-500">{formatCurrency(ing.cost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-200">
                  <h3 className="font-semibold text-lg mb-3">Cost Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedRecipe.cost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedRecipe.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Profit</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedRecipe.price - selectedRecipe.cost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Margin</p>
                      <p className="text-xl font-bold text-green-600">
                        {calculateProfit(selectedRecipe.price, selectedRecipe.cost)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecipe(null)}>
                Tutup
              </Button>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600">
                <Edit className="w-4 h-4 mr-2" />
                Edit Resep
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RecipeManagementPage;
