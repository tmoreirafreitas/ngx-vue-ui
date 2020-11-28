<template>
  <div class="home">
    <div class="container">
      <div class="row" v-if="comments.length > 0 && photos.length > 0">
        <div class="col-xl-6 col-lg-6 col-md-6">
          <InputMultiSelect
            :options="comments"
            :displayTextProperty="'email'"
            :valueProperty="'id'"
            :label="'Comments'"
            @onSelectedItems="onSelectedItems($event)"
          >
          </InputMultiSelect>
        </div>
        <div class="col-xl-6 col-lg-6 col-md-6">
          <Modal
            v-model:value="modalOpen"
            :title="'Teste Modal'"
            @onCloseModal="modalOpen = $event"
          >
            <template #body> Modal de Teste </template>
          </Modal>
          <button
            type="button"
            class="btn btn-primary mr-3 my-4"
            @click="openModal"
          >
            Open modal
          </button>
          <button
            type="button"
            class="btn btn-success ml-3 my-4"
            @click="showAlert()"
          >
            success alert
          </button>
        </div>
      </div>
      <br />

      <div class="row">
        <div class="col-xl-12 col-lg-12 col-md-12">
          <InputDropDownGrid
            :label="'Users'"
            :columns="columns"
            :data="users"
            :displayTextProperty="'username'"
            :itemsPerPage="5"
            :showActionsColumn="true"
            :actionsColumnCaption="'Ações'"
            :actionsColumnWidth="'150px'"
            :firstText="'&laquo;'"
            :previousText="'&lsaquo;'"
            :nextText="'&rsaquo;'"
            :lastText="'&raquo;'"
            v-if="users.length > 0"
          >
          </InputDropDownGrid>
        </div>
      </div>
      <br />

      <div class="row">
        <div class="col-xl-12 col-lg-12 col-md-12">
          <Datagrid
            :columns="columnsComments"
            :data="comments"
            :itemsPerPage="5"
            :showActionsColumn="false"
            :firstText="'&laquo;'"
            :previousText="'&lsaquo;'"
            :nextText="'&rsaquo;'"
            :lastText="'&raquo;'"
            :showCheckboxColumn="true"
            :showSelectAllCheckbox="true"
            v-if="comments.length > 0"
          >
          </Datagrid>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
/* eslint-disable no-unused-vars */
/* eslint-disable */
import {
  computed,
  createApp,
  defineComponent,
  onBeforeMount,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  watch,
  onErrorCaptured,
} from "vue";
import Datagrid from "@/components/Datagrid";
import DataGridColumnModel from "@/components/model/DataGridColumnModel";
import Modal from "@/components/Modal";
import ModalAlert from "@/components/ModalAlert";
import InputMultiSelect from "@/components/input-forms/InputMultiSelect";
import InputDropDownGrid from "../components/input-forms/InputDropDownGrid";
import mount from "@/utils/vue-mount-component.js";
import api from "@/services/apiService";
export default defineComponent({
  name: "Home",
  components: {
    Datagrid,
    Modal,
    ModalAlert,
    InputMultiSelect,
    InputDropDownGrid,
  },

  setup(props) {
    const state = reactive({
      columns: [
        new DataGridColumnModel("Nome", "name"),
        new DataGridColumnModel("Usuário", "username"),
        new DataGridColumnModel("E-mail", "email"),
        new DataGridColumnModel("Telefone", "phone", false, false),
        new DataGridColumnModel("Company", "company.name"),
        new DataGridColumnModel(
          "Endereço",
          "address.street",
          (row, currentData, index) => {
            return `<small><strong>${currentData}</strong></small>`;
          }
        ),
        new DataGridColumnModel("Cidade", "address.city", false, false),
      ],
      columnsComments: [
        new DataGridColumnModel("PostId", "postId"),
        new DataGridColumnModel("ID", "id"),
        new DataGridColumnModel("Name", "name"),
        new DataGridColumnModel("E-mail", "email"),
      ],
      users: [],
      comments: [],
      photos: [],
      modalOpen: false,
      alert: null,
      obj: null,
    });

    onBeforeMount(async () => {
      await fetchAllUsers();
      await fetchAllComments();
      await fetAllPhotos();
    });

    const error = ref(null);
    onErrorCaptured((e) => {
      error.value = e;
      return true;
    });

    onMounted(() => {
      state.obj = mount(ModalAlert);
      state.alert = state.obj.componentInstance;
    });

    onUnmounted(() => {
      state.obj.destroy();
      state.obj = null;
      state.alert = null;
    });

    function openModal() {
      state.modalOpen = !state.modalOpen;
    }

    function showAlert() {
      state.alert.success("Yeahhh", "Some success text here =)");
    }

    const onSelectedItems = (items) => {
      // console.log("itens selecionados: ", items);
    };

    const handleSelectedItem = (item, indexRow) => {
      console.log("index: ", indexRow);
      console.log("item: ", item);
    };

    const fetchAllUsers = async () => {
      const response = await api.get("users");
      state.users = response.data;
    };

    const fetchAllComments = async () => {
      const response = await api.get("comments");
      state.comments = response.data;
    };

    const fetAllPhotos = async () => {
      const response = await api.get("photos");
      state.photos = response.data;
    };

    return {
      openModal,
      showAlert,
      onSelectedItems,
      handleSelectedItem,
      fetchAllUsers,
      ...toRefs(state),
      error,
    };
  },
});
</script>
