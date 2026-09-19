/**
 * Not connected to navigation yet (ticket 05 defines the screens/routes);
 * exported to be registered once navigation exists.
 */
import { collectionGroup, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { installmentConverter } from '../data/collections';
import { db } from '../data/firebaseConfig';
import { getNotificationPreference, saveNotificationPreference } from '../data/notificationPreferenceRepository';
import type { NotificationPreference } from '../domain/types';
import { syncNotifications } from '../notifications/scheduling';
import { isExpoGo, requestNotificationPermission } from '../notifications/permissions';
import { AppButton } from '../ui/AppButton';
import { Card } from '../ui/Card';
import { ScreenContainer } from '../ui/ScreenContainer';
import { TextField } from '../ui/TextField';
import { colors, spacing, typography } from '../ui/theme';

export default function NotificationPreferenceScreen() {
  const [daysBefore, setDaysBefore] = useState('3');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return getNotificationPreference((preference) => {
      setDaysBefore(String(preference.daysBefore));
      setEnabled(preference.enabled);
    });
  }, []);

  async function save() {
    const preference: NotificationPreference = {
      daysBefore: Math.max(0, Number.parseInt(daysBefore, 10) || 0),
      enabled,
    };

    setSaving(true);
    try {
      await saveNotificationPreference(preference);

      if (preference.enabled && !(await requestNotificationPermission())) {
        return;
      }

      const installments = await getDocs(
        collectionGroup(db, 'installments').withConverter(installmentConverter)
      );
      await syncNotifications(
        installments.docs.map((doc) => doc.data()),
        preference
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll>
      {isExpoGo() && (
        <Card style={styles.warningCard}>
          <Text style={styles.warning}>
            Notifications require a development build, they don't work in Expo Go (Android, from SDK 53 on). The
            preference is saved normally, but schedules only start working after running `expo run:android` /
            `expo run:ios` or an EAS development build.
          </Text>
        </Card>
      )}

      <Card>
        <TextField
          label="Notify how many days before the due date"
          keyboardType="number-pad"
          value={daysBefore}
          onChangeText={setDaysBefore}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Notifications enabled</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

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
  warningCard: { backgroundColor: colors.warningSoft, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  label: { ...typography.body, fontWeight: '600' },
  warning: { fontSize: 13, color: colors.warning, lineHeight: 18 },
  button: { marginTop: spacing.lg },
});
