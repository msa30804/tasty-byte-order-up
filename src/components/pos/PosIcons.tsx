import { 
  Coffee, 
  Utensils, 
  Dessert, 
  CupSoda, 
  Table, 
  ClipboardList, 
  CreditCard, 
  ChefHat, 
  ShoppingCart, 
  Clock, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  Save, 
  Receipt,
  UserCircle,
  CheckCircle2,
  Printer,
  Edit,
  Percent,
  Settings,
  Users,
  LogOut,
  Home,
  Database
} from "lucide-react";

export const RestaurantIcon = Utensils;
export const TableIcon = Table;
export const ClipboardListIcon = ClipboardList;
export const CreditCardIcon = CreditCard;
export const ChefIcon = ChefHat;
export const CartIcon = ShoppingCart;
export const ClockIcon = Clock;
export const TrashIcon = Trash2;
export const PlusIcon = PlusCircle;
export const MinusIcon = MinusCircle;
export const SaveIcon = Save;
export const ReceiptIcon = Receipt;
export const UserIcon = UserCircle;
export const CheckIcon = CheckCircle2;
export const PrinterIcon = Printer;
export const EditIcon = Edit;
export const PercentIcon = Percent;
export const SettingsIcon = Settings;
export const UsersIcon = Users;
export const LogOutIcon = LogOut;
export const HomeIcon = Home;
export const DatabaseIcon = Database;

export const StarterIcon = Coffee;
export const MainCourseIcon = Utensils;
export const DessertIcon = Dessert;
export const DrinkIcon = CupSoda;
export const SideIcon = ClipboardList;

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Starters":
      return StarterIcon;
    case "Main Course":
      return MainCourseIcon;
    case "Desserts":
      return DessertIcon;
    case "Drinks":
      return DrinkIcon;
    case "Sides":
      return SideIcon;
    default:
      return RestaurantIcon;
  }
};
