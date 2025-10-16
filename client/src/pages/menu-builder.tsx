import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Pencil, Trash2, GripVertical, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Restaurant, Category, MenuItem, ModifierGroup, Modifier, InsertCategory, InsertMenuItem, InsertModifierGroup, InsertModifier } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function MenuBuilder() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get("restaurantId");
  const { toast } = useToast();
  
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modifierDialog, setModifierDialog] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [groupDialog, setGroupDialog] = useState(false);
  const [modifierFormDialog, setModifierFormDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [categoryForm, setCategoryForm] = useState<InsertCategory>({
    restaurantId: restaurantId || "",
    name: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  const [itemForm, setItemForm] = useState<InsertMenuItem>({
    categoryId: "",
    name: "",
    description: "",
    price: "0.00",
    imageUrl: "",
    dietaryTags: [],
    isAvailable: true,
    displayOrder: 0,
  });

  const [groupForm, setGroupForm] = useState<InsertModifierGroup>({
    menuItemId: "",
    name: "",
    selectionType: "multiple",
    isRequired: false,
    minSelections: 0,
    maxSelections: null,
    displayOrder: 0,
  });

  const [modifierForm, setModifierForm] = useState<InsertModifier>({
    modifierGroupId: "",
    name: "",
    priceAdjustment: "0.00",
    isAvailable: true,
    displayOrder: 0,
  });

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items", selectedCategory],
    enabled: !!selectedCategory,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryDialog(false);
      setCategoryForm({
        restaurantId: restaurantId || "",
        name: "",
        description: "",
        displayOrder: 0,
        isActive: true,
      });
      toast({ title: "Category created successfully" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      const res = await apiRequest("POST", "/api/menu-items", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      setItemDialog(false);
      setEditingItem(null);
      setItemForm({
        categoryId: "",
        name: "",
        description: "",
        price: "0.00",
        imageUrl: "",
        dietaryTags: [],
        isAvailable: true,
        displayOrder: 0,
      });
      toast({ title: "Menu item created successfully" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertMenuItem> }) => {
      const res = await apiRequest("PATCH", `/api/menu-items/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      setItemDialog(false);
      setEditingItem(null);
      setItemForm({
        categoryId: "",
        name: "",
        description: "",
        price: "0.00",
        imageUrl: "",
        dietaryTags: [],
        isAvailable: true,
        displayOrder: 0,
      });
      toast({ title: "Menu item updated successfully" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setSelectedCategory(null);
      toast({ title: "Category deleted successfully" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/menu-items/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({ title: "Menu item deleted successfully" });
    },
  });

  // Modifier Groups
  const { data: modifierGroups } = useQuery<ModifierGroup[]>({
    queryKey: ["/api/modifier-groups", selectedMenuItem],
    enabled: !!selectedMenuItem,
  });

  const { data: modifiers } = useQuery<Modifier[]>({
    queryKey: ["/api/modifiers", selectedGroup],
    enabled: !!selectedGroup,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: InsertModifierGroup) => {
      const res = await apiRequest("POST", "/api/modifier-groups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modifier-groups"] });
      setGroupDialog(false);
      setGroupForm({
        menuItemId: "",
        name: "",
        selectionType: "multiple",
        isRequired: false,
        minSelections: 0,
        maxSelections: null,
        displayOrder: 0,
      });
      toast({ title: "Option group created successfully" });
    },
  });

  const createModifierMutation = useMutation({
    mutationFn: async (data: InsertModifier) => {
      const res = await apiRequest("POST", "/api/modifiers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modifiers"] });
      setModifierFormDialog(false);
      setModifierForm({
        modifierGroupId: "",
        name: "",
        priceAdjustment: "0.00",
        isAvailable: true,
        displayOrder: 0,
      });
      toast({ title: "Option added successfully" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/modifier-groups/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modifier-groups"] });
      setSelectedGroup(null);
      toast({ title: "Option group deleted successfully" });
    },
  });

  const deleteModifierMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/modifiers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modifiers"] });
      toast({ title: "Option deleted successfully" });
    },
  });

  if (!restaurantId) {
    return <div className="p-6">Please select a restaurant first</div>;
  }

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Menu Builder</h1>
        <p className="text-muted-foreground mt-1">
          {restaurant?.name ? `Building menu for ${restaurant.name}` : "Create categories and items"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-lg">Categories</CardTitle>
            <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-category">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => { e.preventDefault(); createCategoryMutation.mutate(categoryForm); }}>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>Create a new menu category</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Category Name *</Label>
                      <Input
                        id="category-name"
                        data-testid="input-category-name"
                        placeholder="Appetizers"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-description">Description</Label>
                      <Textarea
                        id="category-description"
                        data-testid="input-category-description"
                        placeholder="Delicious starters..."
                        value={categoryForm.description || ""}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-submit-category">
                      Create Category
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {!categories || categories.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-muted-foreground mb-2">No categories yet</p>
                <p className="text-xs text-muted-foreground">
                  Click the <Plus className="w-3 h-3 inline mx-1" /> button above to create your first category
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className={`flex items-center gap-2 p-3 rounded-md ${selectedCategory === category.id ? "bg-primary/10" : ""}`}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    data-testid={`button-category-${category.id}`}
                    className="flex-1 text-left hover-elevate rounded-md p-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-delete-category-${category.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{category.name}" and all its menu items. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteCategoryMutation.mutate(category.id)} data-testid={`button-confirm-delete-category-${category.id}`}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Menu Items Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-lg">
              {selectedCategory ? "Menu Items" : "Select a category"}
            </CardTitle>
            {selectedCategory && (
              <Dialog open={itemDialog} onOpenChange={(open) => {
                setItemDialog(open);
                if (!open) {
                  setEditingItem(null);
                  setItemForm({
                    categoryId: "",
                    name: "",
                    description: "",
                    price: "0.00",
                    imageUrl: "",
                    dietaryTags: [],
                    isAvailable: true,
                    displayOrder: 0,
                  });
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setEditingItem(null)} data-testid="button-add-item">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (editingItem) {
                      updateItemMutation.mutate({ id: editingItem.id, data: itemForm });
                    } else {
                      createItemMutation.mutate({ ...itemForm, categoryId: selectedCategory }); 
                    }
                  }}>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update the details for this menu item" : "Create a new item in this category"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="item-name">Item Name *</Label>
                          <Input
                            id="item-name"
                            data-testid="input-item-name"
                            placeholder="Classic Burger"
                            value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-price">Price *</Label>
                          <Input
                            id="item-price"
                            data-testid="input-item-price"
                            type="number"
                            step="0.01"
                            placeholder="12.99"
                            value={itemForm.price}
                            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="item-description">Description</Label>
                        <Textarea
                          id="item-description"
                          data-testid="input-item-description"
                          placeholder="Fresh ingredients, perfectly seasoned..."
                          value={itemForm.description || ""}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Item Image</Label>
                        <ImageUpload
                          value={itemForm.imageUrl || ""}
                          onChange={(url) => setItemForm({ ...itemForm, imageUrl: url })}
                          onRemove={() => setItemForm({ ...itemForm, imageUrl: "" })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dietary Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {["vegetarian", "vegan", "gluten-free", "dairy-free"].map((tag) => (
                            <label key={tag} className="flex items-center gap-2">
                              <Checkbox
                                checked={itemForm.dietaryTags?.includes(tag)}
                                onCheckedChange={(checked) => {
                                  const tags = itemForm.dietaryTags || [];
                                  setItemForm({
                                    ...itemForm,
                                    dietaryTags: checked
                                      ? [...tags, tag]
                                      : tags.filter((t) => t !== tag),
                                  });
                                }}
                              />
                              <span className="text-sm capitalize">{tag}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createItemMutation.isPending || updateItemMutation.isPending} 
                        data-testid="button-submit-item"
                      >
                        {editingItem ? "Update Item" : "Create Item"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCategory ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {!categories || categories.length === 0 
                    ? "Create a category first, then add menu items to it"
                    : "Select a category from the left to view and manage items"}
                </p>
              </div>
            ) : !menuItems || menuItems.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-muted-foreground mb-2">No items in this category yet</p>
                <p className="text-xs text-muted-foreground">
                  Click "Add Item" above to create your first menu item
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {menuItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold" data-testid={`text-item-name-${item.id}`}>{item.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              <div className="flex gap-2 mt-2">
                                {item.dietaryTags?.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right flex flex-col gap-2 items-end">
                              <p className="text-lg font-bold text-primary">${item.price}</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setEditingItem(item);
                                  setItemForm({
                                    categoryId: item.categoryId,
                                    name: item.name,
                                    description: item.description || "",
                                    price: item.price,
                                    imageUrl: item.imageUrl || "",
                                    dietaryTags: item.dietaryTags || [],
                                    isAvailable: item.isAvailable,
                                    displayOrder: item.displayOrder,
                                  });
                                  setItemDialog(true);
                                }}
                                data-testid={`button-edit-item-${item.id}`}
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedMenuItem(item.id);
                                  setModifierDialog(true);
                                }}
                                data-testid={`button-manage-options-${item.id}`}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Manage Options
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" data-testid={`button-delete-item-${item.id}`}>
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{item.name}". This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteItemMutation.mutate(item.id)} data-testid={`button-confirm-delete-item-${item.id}`}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modifier Groups Dialog */}
      <Dialog open={modifierDialog} onOpenChange={setModifierDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Item Options</DialogTitle>
            <DialogDescription>
              Add and manage option groups (like sizes, toppings, extras) for this menu item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Option Groups</h3>
              <Dialog open={groupDialog} onOpenChange={setGroupDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => {
                    setGroupForm({
                      menuItemId: selectedMenuItem || "",
                      name: "",
                      selectionType: "multiple",
                      isRequired: false,
                      minSelections: 0,
                      maxSelections: null,
                      displayOrder: 0,
                    });
                  }} data-testid="button-add-group">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Option Group</DialogTitle>
                    <DialogDescription>
                      Create a group like "Size", "Toppings", or "Extras"
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    createGroupMutation.mutate(groupForm);
                  }}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Group Name</Label>
                        <Input
                          placeholder="e.g. Size, Toppings, Extras"
                          value={groupForm.name}
                          onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                          required
                          data-testid="input-group-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Selection Type</Label>
                        <Select
                          value={groupForm.selectionType}
                          onValueChange={(value: "single" | "multiple") =>
                            setGroupForm({ ...groupForm, selectionType: value })
                          }
                        >
                          <SelectTrigger data-testid="select-selection-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Choice (Radio)</SelectItem>
                            <SelectItem value="multiple">Multiple Choice (Checkboxes)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="required"
                          checked={groupForm.isRequired}
                          onCheckedChange={(checked) =>
                            setGroupForm({ ...groupForm, isRequired: !!checked })
                          }
                          data-testid="checkbox-required"
                        />
                        <Label htmlFor="required">Required</Label>
                      </div>
                      {groupForm.selectionType === "multiple" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Min Selections</Label>
                            <Input
                              type="number"
                              min="0"
                              value={groupForm.minSelections}
                              onChange={(e) =>
                                setGroupForm({ ...groupForm, minSelections: parseInt(e.target.value) || 0 })
                              }
                              data-testid="input-min-selections"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Selections (optional)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={groupForm.maxSelections || ""}
                              onChange={(e) =>
                                setGroupForm({
                                  ...groupForm,
                                  maxSelections: e.target.value ? parseInt(e.target.value) : null,
                                })
                              }
                              data-testid="input-max-selections"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="mt-4">
                      <Button type="submit" disabled={createGroupMutation.isPending} data-testid="button-submit-group">
                        Create Group
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {!modifierGroups || modifierGroups.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-sm text-muted-foreground">
                  No option groups yet. Click "Add Group" to create one.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {modifierGroups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{group.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {group.selectionType === "single" ? "Single choice" : "Multiple choice"}
                            {group.isRequired && " • Required"}
                            {group.minSelections > 0 && ` • Min: ${group.minSelections}`}
                            {group.maxSelections && ` • Max: ${group.maxSelections}`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={modifierFormDialog && selectedGroup === group.id} onOpenChange={(open) => {
                            setModifierFormDialog(open);
                            if (open) setSelectedGroup(group.id);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => {
                                setSelectedGroup(group.id);
                                setModifierForm({
                                  modifierGroupId: group.id,
                                  name: "",
                                  priceAdjustment: "0.00",
                                  isAvailable: true,
                                  displayOrder: 0,
                                });
                              }} data-testid={`button-add-modifier-${group.id}`}>
                                <Plus className="w-3 h-3 mr-1" />
                                Add Option
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Option to {group.name}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                createModifierMutation.mutate(modifierForm);
                              }}>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Option Name</Label>
                                    <Input
                                      placeholder="e.g. Large, Extra Cheese, BBQ Sauce"
                                      value={modifierForm.name}
                                      onChange={(e) => setModifierForm({ ...modifierForm, name: e.target.value })}
                                      required
                                      data-testid="input-modifier-name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Price Adjustment</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={modifierForm.priceAdjustment}
                                      onChange={(e) =>
                                        setModifierForm({ ...modifierForm, priceAdjustment: e.target.value })
                                      }
                                      required
                                      data-testid="input-price-adjustment"
                                    />
                                  </div>
                                </div>
                                <DialogFooter className="mt-4">
                                  <Button type="submit" disabled={createModifierMutation.isPending} data-testid="button-submit-modifier">
                                    Add Option
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" data-testid={`button-delete-group-${group.id}`}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Option Group?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{group.name}" and all its options.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteGroupMutation.mutate(group.id)} data-testid={`button-confirm-delete-group-${group.id}`}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {group.id && selectedGroup === group.id && modifiers && modifiers.length > 0 && (
                        <div className="space-y-2">
                          {modifiers.map((modifier) => (
                            <div key={modifier.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="text-sm font-medium">{modifier.name}</span>
                                {parseFloat(modifier.priceAdjustment) !== 0 && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {parseFloat(modifier.priceAdjustment) > 0 ? "+" : ""}${modifier.priceAdjustment}
                                  </span>
                                )}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" data-testid={`button-delete-modifier-${modifier.id}`}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Option?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{modifier.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteModifierMutation.mutate(modifier.id)} data-testid={`button-confirm-delete-modifier-${modifier.id}`}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      )}
                      {(!selectedGroup || selectedGroup !== group.id) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setSelectedGroup(group.id)}
                          data-testid={`button-view-modifiers-${group.id}`}
                        >
                          View Options
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
