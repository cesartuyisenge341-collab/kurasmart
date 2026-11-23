import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createChildProfile,
  getChildErrorMessage,
  listChildren,
} from '../../services/childService';
import { formatChildAge } from '../../utils/childAge';
import { colors } from '../../theme/colors';

export default function ChildProfilesSection({ parentUid }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadChildren(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const profiles = await listChildren(parentUid);
      setChildren(profiles);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(getChildErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadChildren();
  }, [parentUid]);

  async function saveChild() {
    setSaving(true);
    setErrorMessage('');

    try {
      await createChildProfile({ parentUid, name, dateOfBirth });
      setName('');
      setDateOfBirth('');
      setShowForm(false);
      await loadChildren(true);
    } catch (error) {
      setErrorMessage(getChildErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Children</Text>
          <Text style={styles.sectionDescription}>
            Profiles are private to your family.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setErrorMessage('');
            setShowForm((visible) => !visible);
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>
            {showForm ? 'Cancel' : 'Add child'}
          </Text>
        </Pressable>
      </View>

      {errorMessage ? (
        <View accessibilityRole="alert" style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          {!showForm && (
            <Pressable
              accessibilityRole="button"
              onPress={() => loadChildren(true)}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Child profile</Text>
          <Text style={styles.label}>Child’s name</Text>
          <TextInput
            accessibilityLabel="Child’s name"
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={name}
          />
          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            accessibilityLabel="Date of birth"
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={dateOfBirth}
            maxLength={10}
          />
          <Text style={styles.hint}>
            Enter a real date. Child profiles support ages 0–5.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: saving }}
            disabled={saving}
            onPress={saveChild}
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || saving) && styles.buttonPressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.saveButtonText}>Save child profile</Text>
            )}
          </Pressable>
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          accessibilityLabel="Loading child profiles"
          color={colors.primary}
          style={styles.loader}
        />
      ) : children.length === 0 && !errorMessage ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No child profiles yet</Text>
          <Text style={styles.emptyText}>
            Add a profile to begin recording development information.
          </Text>
        </View>
      ) : children.length > 0 ? (
        <View style={styles.list}>
          {children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {child.name.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.childDetails}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>
                  {formatChildAge(child.dateOfBirth)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
      {refreshing ? (
        <Text style={styles.refreshStatus}>Updating profiles…</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#E8F1FF',
  },
  addButtonText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingTop: 8,
  },
  retryText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  form: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 16,
  },
  formTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 14,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -4,
  },
  saveButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 28,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
  },
  list: {
    gap: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4D8',
  },
  avatarText: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  childDetails: {
    marginLeft: 13,
  },
  childName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  childAge: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  refreshStatus: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
