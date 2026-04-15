import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Pencil, Trash2, Plus } from 'lucide-react-native';
import { useAuth } from '~/lib/hooks/useAuth';
import { AuthPrompt } from '~/components/layout/AuthPrompt';
import { useAddresses, useDeleteAddress } from '~/lib/hooks/useAddresses';
import { Button, Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { ShippingAddress } from '~/types/models';

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: ShippingAddress;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const label = address.label || 'Address';

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
      <View style={styles.cardHeader}>
        <MapPin color={colors.brandPrimary} size={20} />
        <Text variant="headingSm" style={{ color: colors.textPrimary, flex: 1 }}>
          {label}
        </Text>
        {address.is_default && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.brandPrimary + '20' }]}>
            <Text variant="caption" style={{ color: colors.brandPrimary, fontWeight: '600' }}>Default</Text>
          </View>
        )}
      </View>
      <Text variant="bodyMd" style={{ color: colors.textPrimary }}>{address.name}</Text>
      <Text variant="bodySm" color="secondary">
        {address.address}, {address.city}, {address.country}
      </Text>
      <Text variant="bodySm" color="secondary">{address.phone}</Text>
      <View style={styles.cardActions}>
        <Pressable onPress={onEdit} style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}>
          <Pencil color={colors.brandPrimary} size={20} />
        </Pressable>
        <Pressable onPress={onDelete} style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}>
          <Trash2 color={colors.error} size={20} />
        </Pressable>
      </View>
    </View>
  );
}

export default function AddressesListScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useAddresses();
  const deleteAddress = useDeleteAddress();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addresses = data?.data ?? [];

  const handleDelete = (addr: ShippingAddress) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(addr.id);
            try {
              await deleteAddress.mutateAsync(addr.id);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return <AuthPrompt title="Addresses" message="Sign in to manage your delivery addresses" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Text variant="headingMd" style={{ color: colors.textPrimary }}>Delivery Addresses</Text>
        <Pressable
          onPress={() => router.push('/addresses/edit')}
          style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Plus color={colors.brandPrimary} size={22} />
          <Text variant="bodyMd" style={{ color: colors.brandPrimary, fontWeight: '600' }}>New</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.brandPrimary}
          />
        }
      >
        {isLoading ? (
          <Text variant="bodyMd" color="secondary">Loading...</Text>
        ) : addresses.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="bodyMd" color="secondary" style={styles.emptyText}>No addresses yet</Text>
            <Button variant="outline" onPress={() => router.push('/addresses/edit')} style={styles.emptyBtn}>
              Add Address
            </Button>
          </View>
        ) : (
          <>
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => router.push({ pathname: '/addresses/edit', params: { id: addr.id } })}
                onDelete={() => handleDelete(addr)}
              />
            ))}
            <Button
              variant="outline"
              onPress={() => router.push('/addresses/edit')}
              style={styles.addMoreBtn}
            >
              Add Address
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { padding: 4 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginBottom: 16 },
  emptyBtn: { minWidth: 200 },
  addMoreBtn: { marginTop: 8 },
});
