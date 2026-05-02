import { useState, useMemo } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COUNTRIES, countryFlag, type Country } from '../data/countries'

type Props = {
  visible: boolean
  onClose: () => void
  onSelect: (country: Country) => void
}

export default function CountryPickerModal({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q)
    )
  }, [query])

  const handleSelect = (country: Country) => {
    onSelect(country)
    setQuery('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.sheet, { paddingBottom: insets.bottom || 16 }]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Select country</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              placeholder="Search country or dial code…"
              placeholderTextColor="#A8A3B8"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.flag}>{countryFlag(item.code)}</Text>
                <Text style={styles.countryName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.dialCode}>+{item.dialCode}</Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 16, 28, 0.5)',
  },
  sheet: {
    backgroundColor: '#FAFAFB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EEEBF2',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#12101C',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEEBF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#4A4458',
    fontWeight: '600',
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEBF2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#12101C',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  flag: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    color: '#12101C',
    fontWeight: '500',
  },
  dialCode: {
    fontSize: 14,
    color: '#A8A3B8',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F4F3F7',
  },
})
