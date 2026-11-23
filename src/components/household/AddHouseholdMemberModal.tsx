import { useState } from "react";
import { Button, Form, Input, InputNumber, Modal, message } from "antd";
import UserAddOutlined from "@ant-design/icons/UserAddOutlined";
import { useAddHouseholdMember } from "@/apis/hooks/useHouseholdMutations";

interface Props {
  // Nivel de quien invoca: el nivel asignable debe ser estrictamente mayor.
  callerLevel: number;
}

const ERRORS: Record<number, string> = {
  404: "No existe un usuario con ese correo",
  409: "Esa persona ya pertenece a un household",
  403: "No tenés permiso para agregar con ese nivel",
};

export default function AddHouseholdMemberModal({ callerLevel }: Props) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const addMutation = useAddHouseholdMember();

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values: { email: string; level: number }) => {
    addMutation.mutate(values, {
      onSuccess: () => {
        message.success(`${values.email} fue agregado al household`);
        handleClose();
      },
      onError: (error) => {
        // @ts-expect-error - response puede estar presente en el error de Axios
        const status = error?.response?.status;
        message.error(ERRORS[status] ?? "Error al agregar al miembro");
      },
    });
  };

  return (
    <>
      <Button type="primary" icon={<UserAddOutlined />} onClick={() => setOpen(true)}>
        Agregar miembro
      </Button>
      <Modal
        open={open}
        title="Agregar miembro"
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="Agregar"
        cancelText="Cancelar"
        confirmLoading={addMutation.isPending}
        destroyOnHidden
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={addMutation.isPending}
          initialValues={{ level: callerLevel + 1 }}
        >
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              { required: true, message: "Por favor ingresá un correo" },
              { type: "email", message: "Ingresá un correo válido" },
            ]}
          >
            <Input placeholder="usuario@ejemplo.com" />
          </Form.Item>
          <Form.Item
            label="Nivel"
            name="level"
            extra={`Debe ser mayor a tu nivel (${callerLevel}). Mayor número = menos poder.`}
            rules={[{ required: true, message: "Por favor ingresá un nivel" }]}
          >
            <InputNumber min={callerLevel + 1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
