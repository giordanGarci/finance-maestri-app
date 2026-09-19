import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { updateClient, createClient } from '../../data/clientsRepository';
import { AppButton } from '../../ui/AppButton';
import { Card } from '../../ui/Card';
import { ScreenContainer } from '../../ui/ScreenContainer';
import { TextField } from '../../ui/TextField';
import { colors, spacing } from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientForm'>;

export function ClientFormScreen({ route, navigation }: Props) {
  const existingClient = route.params?.client;
  const [name, setName] = useState(existingClient?.name ?? '');
  const [phone, setPhone] = useState(existingClient?.phone ?? '');
  const [notes, setNotes] = useState(existingClient?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter the client name.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const data = {
        name: trimmedName,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (existingClient) {
        await updateClient(existingClient.id, data);
      } else {
        await createClient(data);
      }
      navigation.goBack();
    } catch (caughtError) {
      setError(String(caughtError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Card>
        <TextField label="Name *" value={name} onChangeText={setName} placeholder="Client name" />
        <TextField
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="(optional)"
          keyboardType="phone-pad"
        />
        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="(optional)"
          style={styles.multiline}
          multiline
        />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton
        title={saving ? 'Saving...' : 'Save'}
        onPress={save}
        disabled={saving}
        loading={saving}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  error: { color: colors.danger, marginTop: spacing.md, fontSize: 14, fontWeight: '600' },
  button: { marginTop: spacing.lg },
});
