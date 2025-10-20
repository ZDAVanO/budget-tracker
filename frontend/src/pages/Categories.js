import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Callout,
  Card,
  Container,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
  Section,
  SegmentedControl,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon, PlusCircledIcon, Cross2Icon } from '@radix-ui/react-icons';
import api from '../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '📌', type: 'both' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data);
      }
    } catch (loadError) {
      console.error('Error loading categories:', loadError);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingCategory) {
        const { response, data } = await api.categories.update(editingCategory.id, formData);
        if (!response.ok) {
          setError(data?.msg || 'Помилка оновлення категорії');
          return;
        }
      } else {
        const { response, data } = await api.categories.create(formData);
        if (!response.ok) {
          setError(data?.msg || 'Помилка створення категорії');
          return;
        }
      }

      setFormData({ name: '', description: '', icon: '📌', type: 'both' });
      setIsFormOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (saveError) {
      console.error('Error saving category:', saveError);
      setError('Помилка збереження');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📌',
      type: category.type,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Видалити категорію "${category.name}"?`)) {
      return;
    }

    try {
      const { response, data } = await api.categories.delete(category.id);
      if (response.ok) {
        loadCategories();
      } else {
        const errorMsg = data?.msg || 'Помилка при видаленні категорії';
        alert(errorMsg);
        console.error('Delete error:', { status: response.status, data });
      }
    } catch (deleteError) {
      console.error('Error deleting category:', deleteError);
      alert('Помилка при видаленні категорії');
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '📌', type: 'both' });
    setError('');
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '📌', type: 'both' });
    setError('');
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '📌', type: 'both' });
      setError('');
    }
  };

  const typeBadge = (type) => {
    if (type === 'income') {
      return <Badge color="mint">Доходи</Badge>;
    }
    if (type === 'expense') {
      return <Badge color="tomato">Витрати</Badge>;
    }
    return <Badge color="gray">Для всіх</Badge>;
  };

  return (
    <Section size="3">
      <Container size="3">
        <Flex direction="column" gap="6">
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Flex direction="column" gap="1">
              <Heading as="h1" size="7">
                Категорії
              </Heading>
              <Text color="gray">Класифікуйте витрати та доходи для точного аналізу.</Text>
            </Flex>
            <Dialog.Root open={isFormOpen} onOpenChange={handleFormOpenChange}>
              <Dialog.Trigger asChild>
                <Button onClick={handleCreateClick}>
                  <PlusCircledIcon /> Додати категорію
                </Button>
              </Dialog.Trigger>
              <Dialog.Content maxWidth="540px">
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="space-between">
                    <Dialog.Title asChild>
                      <Heading size="5">
                        {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
                      </Heading>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <IconButton
                        variant="ghost"
                        color="gray"
                        radius="full"
                        aria-label="Закрити форму категорії"
                      >
                        <Cross2Icon />
                      </IconButton>
                    </Dialog.Close>
                  </Flex>

                  <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="4">
                      <Grid columns={{ initial: '1', md: '2' }} gap="4">
                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="name">
                            Назва
                          </Text>
                          <TextField.Root
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={(event) => updateField('name', event.target.value)}
                            placeholder="Наприклад: Транспорт"
                          />
                        </Flex>

                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="icon">
                            Іконка
                          </Text>
                          <TextField.Root
                            id="icon"
                            name="icon"
                            value={formData.icon}
                            onChange={(event) => updateField('icon', event.target.value)}
                            maxLength={5}
                            placeholder="📌"
                          />
                        </Flex>
                      </Grid>

                      <Flex direction="column" gap="2">
                        <Text>Тип категорії</Text>
                        <SegmentedControl.Root value={formData.type} onValueChange={(value) => updateField('type', value)}>
                          <SegmentedControl.Item value="both">Для всіх</SegmentedControl.Item>
                          <SegmentedControl.Item value="expense">Витрати</SegmentedControl.Item>
                          <SegmentedControl.Item value="income">Доходи</SegmentedControl.Item>
                        </SegmentedControl.Root>
                      </Flex>

                      <Flex direction="column" gap="2">
                        <Text as="label" htmlFor="description">
                          Опис
                        </Text>
                        <TextArea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={(event) => updateField('description', event.target.value)}
                          placeholder="Додаткова інформація"
                        />
                      </Flex>

                      {error && (
                        <Callout.Root color="red" variant="surface">
                          <Callout.Text>{error}</Callout.Text>
                        </Callout.Root>
                      )}

                      <Flex justify="flex-end" gap="3">
                        <Button type="submit">{editingCategory ? 'Зберегти зміни' : 'Додати категорію'}</Button>
                        <Button type="button" variant="soft" color="gray" onClick={handleCancelForm}>
                          Скасувати
                        </Button>
                      </Flex>
                    </Flex>
                  </form>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>

          {isLoading ? (
            <Flex align="center" justify="center" style={{ minHeight: 200 }}>
              <Text color="gray">Завантаження...</Text>
            </Flex>
          ) : (
            <Card variant="surface" size="5">
              <Flex direction="column" gap="4">
                <Heading size="5">Усі категорії ({categories.length})</Heading>
                {categories.length === 0 ? (
                  <Callout.Root>
                    <Callout.Text color="gray">Поки що немає категорій. Створіть першу, щоб почати.</Callout.Text>
                  </Callout.Root>
                ) : (
                  <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
                    {categories.map((category) => (
                      <Card key={category.id} variant="classic">
                        <Flex direction="column" gap="3">
                          <Flex align="center" justify="between">
                            <Flex align="center" gap="3">
                              <Text size="5">{category.icon}</Text>
                              <Flex direction="column" gap="1">
                                <Text weight="medium">{category.name}</Text>
                                {typeBadge(category.type)}
                              </Flex>
                            </Flex>
                            <Flex gap="2">
                              <IconButton size="2" variant="soft" onClick={() => handleEdit(category)}>
                                <Pencil2Icon />
                              </IconButton>
                              <IconButton size="2" variant="soft" color="red" onClick={() => handleDelete(category)}>
                                <TrashIcon />
                              </IconButton>
                            </Flex>
                          </Flex>
                          {category.description && (
                            <Text color="gray" size="2">
                              {category.description}
                            </Text>
                          )}
                        </Flex>
                      </Card>
                    ))}
                  </Grid>
                )}
              </Flex>
            </Card>
          )}
        </Flex>
      </Container>
    </Section>
  );
}

export default Categories;
