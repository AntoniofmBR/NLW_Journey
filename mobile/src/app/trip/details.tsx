import { Alert, FlatList, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react-native';

import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { colors } from '@/styles/colors';
import { Input } from '@/components/input';
import { validateInput } from '@/utils/validateInput';
import { linksServer } from '@/server/links-server';
import { TripLink, TripLinkProps } from '@/components/tripLink';
import { participantsServer } from '@/server/participants-server';
import { Participant, ParticipantProps } from '@/components/participant';

export function Details({ tripId }: { tripId: string }) {
  const [ showLinkModal, setShowLinkModal ] = useState(false)

  const [ isCreatingLinkTrip, setIsCreatingLinkTrip ] = useState(false)

  const [ links, setLinks ] = useState<TripLinkProps[]>([])
  const [ participants, setParticipants ] = useState<ParticipantProps[]>([])

  const [ linkTitle, setLinkTitle ] = useState('')
  const [ linkURL, setLinkURL ] = useState('')

  function resetNewLinkFields() {
    setLinkTitle('')
    setLinkURL('')
    setShowLinkModal(false)
  }

  async function handleCreateTripLink() {
    try {
      if (!validateInput.url(linkURL.trim())) {
        return Alert.alert('Link', '❌ Link inválido!')
      }

      if (!linkTitle.trim()) {
        return Alert.alert('Link', '❌ Informe um titulo para o link!')
      }

      setIsCreatingLinkTrip(true)

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkURL,
      })

      Alert.alert('Link', '✔️ Link criado com sucesso!')
      resetNewLinkFields()
      await getTripLinks()

    } catch (err) {
      console.log(err)
    } finally {
      setIsCreatingLinkTrip(false)
    }

  }

  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripId)

      setLinks(links)

    } catch (err) {
      console.log(err)
    }
  }

  async function getTripParticipants() {
    try {
      const participants = await participantsServer.getByTripId(tripId)

      setParticipants(participants)

    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getTripLinks()
    getTripParticipants()
  }, [])

  return (
    <View className='flex-1 mt-10' >
      <Text className='text-zinc-50 text-2xl font-semibold mb-2' >
        Links importantes
      </Text>

      <View className='flex-1' >
        { links.length > 0 ? (
          <FlatList
          data={ links }
          keyExtractor={ (item) => item.id }
          renderItem={ ({ item }) => <TripLink data={ item } /> }
          contentContainerClassName='gap-4'
        />
        ) : (
          <Text className='text-zinc-400 font-regular text-base mt-2 mb-6' >
            Nenhum link adicionado
          </Text>
        ) }

        <Button variant='secondary' onPress={ () => setShowLinkModal(true) } >
          <Plus size={20} color={ colors.zinc['200'] } />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className='flex-1 border-t border-zinc-800 mt-6' >
        <Text className='text-zinc-50 text-2xl font-semibold my-6' >
          Convidados
        </Text>

        <FlatList
          data={ participants }
          keyExtractor={ (item) => item.id }
          renderItem={ ({ item }) => <Participant data={ item } /> }
          contentContainerClassName='gap-4 pb-44'
        />
      </View>

      <Modal
        title='Cadastrar novo link'
        subtitle='Todos os convidados podem visualizar os links importantes'
        visible={ showLinkModal }
        onClose={ () => setShowLinkModal(false) }
      >
        <View className='gap-2 mb-3' >
          <Input variant='secondary' >
            <Input.Field placeholder='Título do link' onChangeText={ setLinkTitle } />
          </Input>

          <Input variant='secondary' >
            <Input.Field placeholder='URL' onChangeText={ setLinkURL } />
          </Input>
        </View>

        <Button isLoading={ isCreatingLinkTrip }  onPress={ handleCreateTripLink } >
          <Button.Title>Salvar link</Button.Title>
        </Button>

      </Modal>

    </View>
  )
}