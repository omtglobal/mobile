import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAddress, useCreateAddress, useUpdateAddress } from '~/lib/hooks/useAddresses';
import { Button, Input, Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';

const LABEL_OPTIONS = ['Home', 'Office', 'Other'] as const;

export default function AddressEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, spacing, radius } = useTheme();
  const isEdit = !!id;

  const { data: addressData } = useAddress(id);
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress(id ?? '');

  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addr = addressData?.data;

  useEffect(() => {
    if (addr) {
      setLabel(addr.label ?? '');
      setName(addr.name);
      setPhone(addr.phone);
      setEmail(addr.email);
      setAddress(addr.address);
      setCity(addr.city);
      setCountry(addr.country);
      setZip(addr.zip ?? '');
      setIsDefault(addr.is_default);
    }
  }, [addr]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!phone.trim()) e.phone = 'Required';
    if (!email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!address.trim()) e.address = 'Required';
    if (!city.trim()) e.city = 'Required';
    if (!country.trim()) e.country = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      label: label || undefined,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      zip: zip.trim() || undefined,
      is_default: isDefault,
    };

    try {
      if (isEdit) {
        await updateAddress.mutateAsync(payload);
      } else {
        await createAddress.mutateAsync(payload);
      }
      router.back();
    } catch (err: unknown) {
      const res = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: { details?: Record<string, string[]> } } } }).response
        : null;
      const details = res?.data?.error?.details as Record<string, string[]> | undefined;
      if (details) {
        const e: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) {
          if (v?.[0]) e[k] = v[0];
        }
        setErrors(e);
      }
    }
  };

  const isPending = createAddress.isPending || updateAddress.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { padding: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.labelSection}>
          <Text variant="bodyMd" color="secondary" style={styles.labelTitle}>Label</Text>
          <View style={styles.chips}>
            {LABEL_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setLabel(opt)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: label === opt ? colors.brandPrimary : colors.bgTertiary,
                    borderRadius: radius.md,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  variant="bodySm"
                  style={{ color: label === opt ? '#fff' : colors.textSecondary, fontWeight: label === opt ? '600' : '400' }}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Input label="Recipient" placeholder="John Doe" value={name} onChangeText={setName} error={errors.name} />
        <Input label="Phone" placeholder="+1234567890" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" />
        <Input label="Email" placeholder="john@example.com" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />
        <Input label="Address" placeholder="123 Main St, Apt 4B" value={address} onChangeText={setAddress} error={errors.address} />
        <Input label="City" placeholder="New York" value={city} onChangeText={setCity} error={errors.city} />
        <View style={styles.row}>
          <Input label="Country" placeholder="US" value={country} onChangeText={setCountry} error={errors.country} style={styles.half} />
          <Input label="ZIP" placeholder="10001" value={zip} onChangeText={setZip} error={errors.zip} keyboardType="number-pad" style={styles.half} />
        </View>

        <Pressable
          onPress={() => setIsDefault(!isDefault)}
          style={[styles.checkboxRow, { borderColor: colors.borderDefault }]}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isDefault ? colors.brandPrimary : 'transparent',
                borderColor: isDefault ? colors.brandPrimary : colors.borderStrong,
              },
            ]}
          >
            {isDefault && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
          </View>
          <Text variant="bodyMd" style={{ color: colors.textPrimary }}>Default address</Text>
        </Pressable>

        <Button variant="primary" onPress={handleSubmit} disabled={isPending} style={styles.submitBtn}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 32 },
  labelSection: { marginBottom: 16 },
  labelTitle: { marginBottom: 8 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {},
});
