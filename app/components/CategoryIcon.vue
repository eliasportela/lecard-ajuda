<template><component :is="iconComponent" /></template>
<script setup lang="ts">
import { Bike, BookOpen, ChartNoAxesColumnIncreasing, ChartNoAxesCombined, CircleAlert, CircleDollarSign, CircleHelp, ClipboardList, CreditCard, Download, Folder, Lightbulb, Megaphone, MessageCircleMore, MonitorSmartphone, Package, Palette, PlugZap, Printer, ReceiptText, ScreenShare, Settings, Settings2, ShieldCheck, ShoppingCart, Store, Truck, UserRound, Users, WalletCards, Wrench } from '@lucide/vue'
import type { CategoryIconName } from '~~/shared/category-icons'
const props = defineProps<{ name?: string | null }>()
const icons: Record<CategoryIconName, typeof Folder> = { Folder, BookOpen, ClipboardList, Palette, Bike, MonitorSmartphone, ChartNoAxesCombined, ShoppingCart, CreditCard, WalletCards, CircleDollarSign, Users, UserRound, MessageCircleMore, Megaphone, PlugZap, Settings, Settings2, Download, Printer, ScreenShare, CircleAlert, ChartNoAxesColumnIncreasing, Package, Truck, Store, ReceiptText, CircleHelp, Lightbulb, ShieldCheck, Wrench }
const iconComponent = computed(() => icons[props.name as CategoryIconName] || Folder)
</script>
