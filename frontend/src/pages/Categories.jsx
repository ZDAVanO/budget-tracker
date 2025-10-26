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
  Spinner,
  Popover,
} from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon, PlusCircledIcon, Cross2Icon } from '@radix-ui/react-icons';
import api from '../services/api';

// MARK: Categories
function Categories() {

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '📌', type: 'both' });
  const [error, setError] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);


  // MARK: useEffect
  useEffect(() => {
    loadCategories();
  }, []);


  // MARK: handlers
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data);
        console.log('Categories loaded:', data);
      }
    } catch (loadError) {
      console.error('Error loading categories:', loadError);
    } finally {
      setIsLoading(false);
    }
  };

  // MARK: updateField
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
          setError(data?.msg || 'Error updating category');
          return;
        }
      } else {
        const { response, data } = await api.categories.create(formData);
        if (!response.ok) {
          setError(data?.msg || 'Error creating category');
          return;
        }
      }

      setFormData({ name: '', description: '', icon: '📌', type: 'both' });
      setIsFormOpen(false);
      setEditingCategory(null);
      loadCategories();

    } catch (saveError) {
      console.error('Error saving category:', saveError);
      setError('Error saving');
    }
  };


  // MARK: handleEdit
  const handleEdit = (category) => {
    if (isProtectedCategory(category)) return; // Забороняємо редагування
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📌',
      type: category.type,
    });
    setIsFormOpen(true);
  };


  // MARK: handleDelete
  const handleDelete = (category) => {
    if (isProtectedCategory(category)) return; // Забороняємо видалення
    setCategoryToDelete(category);
  };


  // MARK: confirmDelete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    if (isProtectedCategory(categoryToDelete)) {
      alert('This category cannot be deleted.');
      setCategoryToDelete(null);
      return;
    }
    try {
      const { response, data } = await api.categories.delete(categoryToDelete.id);
      if (response.ok) {
        loadCategories();
      } else {
        const errorMsg = data?.msg || 'Error deleting category';
        alert(errorMsg);
        console.error('Delete error:', { status: response.status, data });
      }

    } catch (deleteError) {
      console.error('Error deleting category:', deleteError);
      alert('Error deleting category');

    } finally {
      setCategoryToDelete(null);
    }
  };


  // MARK: handleCancelForm
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '📌', type: 'both' });
    setError('');
  };

  
  // MARK: handleCreateClick
  const handleCreateClick = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '📌', type: 'both' });
    setError('');
    setIsFormOpen(true);
  };


  // MARK: handleFormOpenChange
  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '📌', type: 'both' });
      setError('');
    }
  };

  
  // MARK: typeBadge
  const typeBadge = (type) => {
    const style = { width: 'fit-content', paddingRight: 8 };
    if (type === 'income') {
      return <Badge color="mint" style={style}>Income</Badge>;
    }
    if (type === 'expense') {
      return <Badge color="tomato" style={style}>Expense</Badge>;
    }
    return <Badge color="gray" style={style}>For all</Badge>;
  };

  
  // MARK: Protected categories
  // Назви категорій, які не можна редагувати чи видаляти
  const protectedCategoryNames = ['Uncategorized', 'Adjust Balance'];
  const isProtectedCategory = (category) =>
    protectedCategoryNames.includes(category.name);


  // MARK: render
  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Flex direction="column" gap="6">
          {/* MARK: header & add button */}
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            
            <Flex direction="column" gap="1">
              <Heading as="h2" size="7">
                Categories
              </Heading>
              <Text color="gray">Classify expenses and income for accurate analysis.</Text>
            </Flex>

            {/* Move the Add category button outside of Dialog.Trigger */}
            <Button onClick={handleCreateClick}>
              <PlusCircledIcon /> Add category
            </Button>

            <Dialog.Root open={isFormOpen} onOpenChange={handleFormOpenChange}>
              {/* Remove Dialog.Trigger */}
              <Dialog.Content maxWidth="540px">
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="between">
                    <Dialog.Title asChild>
                      <Text size="5" weight="bold">
                        {editingCategory ? 'Edit category' : 'New category'}
                      </Text>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <IconButton
                        variant="ghost"
                        color="gray"
                        radius="full"
                        aria-label="Close category form"
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
                            Name
                          </Text>
                          <TextField.Root
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={(event) => updateField('name', event.target.value)}
                            placeholder="e.g. Transport"
                          />
                        </Flex>

                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="icon">
                            Icon
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
                        <Text>Category type</Text>
                        <SegmentedControl.Root value={formData.type} onValueChange={(value) => updateField('type', value)}>
                          <SegmentedControl.Item value="both">For all</SegmentedControl.Item>
                          <SegmentedControl.Item value="expense">Expense</SegmentedControl.Item>
                          <SegmentedControl.Item value="income">Income</SegmentedControl.Item>
                        </SegmentedControl.Root>
                      </Flex>

                      <Flex direction="column" gap="2">
                        <Text as="label" htmlFor="description">
                          Description
                        </Text>
                        <TextArea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={(event) => updateField('description', event.target.value)}
                          placeholder="Additional information"
                        />
                      </Flex>

                      {error && (
                        <Callout.Root color="red" variant="surface">
                          <Callout.Text>{error}</Callout.Text>
                        </Callout.Root>
                      )}

                      <Flex justify="flex-end" gap="3">
                        <Button type="submit">{editingCategory ? 'Save changes' : 'Add category'}</Button>
                        <Button type="button" variant="soft" color="gray" onClick={handleCancelForm}>
                          Cancel
                        </Button>
                      </Flex>
                    </Flex>
                  </form>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>

          </Flex>

          {/* MARK: delete dialog */}
          <Dialog.Root open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
            <Dialog.Content maxWidth="400px">
              <Flex direction="column" gap="4">
                <Dialog.Title asChild>
                  <Text size="5" weight="bold">Are you sure?</Text>
                </Dialog.Title>
                <Text>
                  Are you sure you want to delete the category{' '}
                  <b>{categoryToDelete?.name}</b>? This action cannot be undone.
                </Text>
                <Callout.Root color="red" variant="surface">
                  <Callout.Text>
                    <b>Warning:</b> All transactions assigned to this category will also be <b>permanently deleted</b>!
                  </Callout.Text>
                </Callout.Root>
                <Flex gap="3" justify="end">
                  <Button variant="soft" color="gray" onClick={() => setCategoryToDelete(null)}>
                    Cancel
                  </Button>
                  <Button color="red" onClick={confirmDelete}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          {/* MARK: categories list */}
          {isLoading ? (
            <Flex justify="center" align="center" style={{ height: '100px' }}>
                <Spinner size="3" />
            </Flex>
          ) : (
            <Flex direction="column" gap="4">

                {categories.length === 0 ? (
                  <Callout.Root>
                    <Callout.Text color="gray">No categories yet. Create your first one to get started.</Callout.Text>
                  </Callout.Root>
                ) : (
                  <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
                    {categories.map((category) => (
                      <Card key={category.id} variant="classic" size="1">
                        <Flex direction="column" gap="3">
                          <Flex align="center" justify="between">
                            <Flex align="center" gap="3">
                              <Text size="6">{category.icon}</Text>
                              <Flex direction="column" gap="1">
                                <Text weight="medium">{category.name}</Text>
                                {typeBadge(category.type)}
                              </Flex>
                            </Flex>
                            <Flex gap="2">
                              <IconButton
                                size="2"
                                variant="soft"
                                onClick={() => handleEdit(category)}
                                disabled={isProtectedCategory(category)}
                                title={isProtectedCategory(category) ? 'This category cannot be edited' : undefined}
                              >
                                <Pencil2Icon />
                              </IconButton>

                              <Popover.Root>
                                <Popover.Trigger asChild>
                                  <IconButton
                                    size="2"
                                    variant="soft"
                                    color="red"
                                    // onClick={() => handleDelete(category)}
                                    disabled={isProtectedCategory(category)}
                                    title={isProtectedCategory(category) ? 'This category cannot be deleted' : undefined}
                                  >
                                    <TrashIcon />
                                  </IconButton>
                                </Popover.Trigger>
                                <Popover.Content align="end" sideOffset={4} style={{ maxWidth: 260 }}>
                                  <Flex direction="column" gap="3">
                                    <Text size="2" color="red" weight="bold">
                                      Delete category?
                                    </Text>
                                    <Text size="2">
                                      All transactions in <b>{category.name}</b> will be <b>permanently deleted</b>!
                                    </Text>
                                    <Flex gap="2" justify="end">
                                      <Button color="red" size="1" onClick={() => handleDelete(category)}>Delete</Button>
                                    </Flex>
                                  </Flex>
                                </Popover.Content>
                              </Popover.Root>

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
          )}
        </Flex>
      </Container>
    </Section>
  );
}

export default Categories;
