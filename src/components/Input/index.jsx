import { Input as InputComp, Typography } from 'antd';

export const Input = (props) => {
  // eslint-disable-next-line react/prop-types
  const { label = '', ...inputProps } = props;
  return (
    <div>
      <Typography.Title level={5} p>
        {label}
      </Typography.Title>
      <InputComp {...inputProps} />
    </div>
  );
};
