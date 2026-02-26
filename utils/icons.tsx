import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  ClipboardIcon,
  FactoryIcon,
  User02Icon,
  PlusSignIcon,
  Clock01Icon,
  Logout01Icon,
  ArrowRight01Icon,
  Search01Icon,
  Wallet01Icon,
  ChartIncreaseIcon,
  UserGroupIcon,
  Building03Icon,
  Package01Icon,
  File01Icon,
  LayoutGridIcon,
  ArrowDown01Icon,
  Location01Icon,
  CheckmarkBadge01Icon,
  Loading01Icon,
  PackageDelivered01Icon,
  Notification01Icon,
  DropletIcon,
  ArrowLeft01Icon,
  Shield01Icon,
  Message01Icon,
  Cancel01Icon,
  FavouriteIcon,
  InformationCircleIcon,
  CrownIcon,
  Store01Icon,
  Calendar01Icon,
  CircleArrowUp01Icon,
  CreditCardIcon,
  Settings01Icon,
  HelpCircleIcon,
  WeightScale01Icon,
  ShoppingBag01Icon,
  MinusSignIcon,
  PrinterIcon,
  Call02Icon,
  JusticeScale01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  CircleIcon,
  PencilEdit01Icon,
  Delete01Icon,
  Briefcase01Icon,
  Mail01Icon,
  UserSettings01Icon,
  ChartDecreaseIcon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  DeliveryTruck01Icon,
  DiscountTag01Icon,
  Comment01Icon,
  AnalyticsUpIcon,
  PieChart01Icon,
  Download01Icon,
  FilterHorizontalIcon,
  InvoiceIcon,
  UserCheck01Icon,
  Sun01Icon,
} from '@hugeicons/core-free-icons';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type HugeIcon = React.FC<IconProps>;

function createIcon(iconDef: any): HugeIcon {
  const IconComponent: HugeIcon = ({ size = 24, color = '#000', strokeWidth }: IconProps) => (
    <HugeiconsIcon icon={iconDef} size={size} color={color} strokeWidth={strokeWidth} />
  );
  return IconComponent;
}

export const Home = createIcon(Home01Icon);
export const ClipboardList = createIcon(ClipboardIcon);
export const Factory = createIcon(FactoryIcon);
export const User = createIcon(User02Icon);
export const Plus = createIcon(PlusSignIcon);
export const Clock = createIcon(Clock01Icon);
export const LogOut = createIcon(Logout01Icon);
export const ChevronRight = createIcon(ArrowRight01Icon);
export const Search = createIcon(Search01Icon);
export const Wallet = createIcon(Wallet01Icon);
export const TrendingUp = createIcon(ChartIncreaseIcon);
export const Users = createIcon(UserGroupIcon);
export const Building2 = createIcon(Building03Icon);
export const Package = createIcon(Package01Icon);
export const FileText = createIcon(File01Icon);
export const Grid3x3 = createIcon(LayoutGridIcon);
export const ChevronDown = createIcon(ArrowDown01Icon);
export const MapPin = createIcon(Location01Icon);
export const Check = createIcon(CheckmarkBadge01Icon);
export const Loader = createIcon(Loading01Icon);
export const PackageCheck = createIcon(PackageDelivered01Icon);
export const Bell = createIcon(Notification01Icon);
export const Droplets = createIcon(DropletIcon);
export const ArrowLeft = createIcon(ArrowLeft01Icon);
export const ArrowRight = createIcon(ArrowRight01Icon);
export const Shield = createIcon(Shield01Icon);
export const MessageCircle = createIcon(Message01Icon);
export const X = createIcon(Cancel01Icon);
export const Star = createIcon(FavouriteIcon);
export const Info = createIcon(InformationCircleIcon);
export const Crown = createIcon(CrownIcon);
export const Store = createIcon(Store01Icon);
export const Calendar = createIcon(Calendar01Icon);
export const ArrowUpCircle = createIcon(CircleArrowUp01Icon);
export const CreditCard = createIcon(CreditCardIcon);
export const Settings = createIcon(Settings01Icon);
export const HelpCircle = createIcon(HelpCircleIcon);
export const Weight = createIcon(WeightScale01Icon);
export const ShoppingBag = createIcon(ShoppingBag01Icon);
export const Minus = createIcon(MinusSignIcon);
export const Printer = createIcon(PrinterIcon);
export const ChevronLeft = createIcon(ArrowLeft01Icon);
export const Phone = createIcon(Call02Icon);
export const Scale = createIcon(JusticeScale01Icon);
export const AlertCircle = createIcon(AlertCircleIcon);
export const CheckCircle2 = createIcon(CheckmarkCircle01Icon);
export const Circle = createIcon(CircleIcon);
export const Pencil = createIcon(PencilEdit01Icon);
export const Trash2 = createIcon(Delete01Icon);
export const Briefcase = createIcon(Briefcase01Icon);
export const Mail = createIcon(Mail01Icon);
export const UserCog = createIcon(UserSettings01Icon);
export const TrendingDown = createIcon(ChartDecreaseIcon);
export const ArrowUpRight = createIcon(ArrowUpRight01Icon);
export const ArrowDownLeft = createIcon(ArrowDownLeft01Icon);
export const Truck = createIcon(DeliveryTruck01Icon);
export const Tag = createIcon(DiscountTag01Icon);
export const MessageSquare = createIcon(Comment01Icon);
export const BarChart3 = createIcon(AnalyticsUpIcon);
export const PieChart = createIcon(PieChart01Icon);
export const Download = createIcon(Download01Icon);
export const FilterHorizontal = createIcon(FilterHorizontalIcon);
export const Receipt = createIcon(InvoiceIcon);
export const UserCheck = createIcon(UserCheck01Icon);
export const Sun = createIcon(Sun01Icon);
