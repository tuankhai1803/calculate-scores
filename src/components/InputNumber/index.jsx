import { InputNumber as InputNumberComp, Typography } from 'antd';
import { forwardRef } from 'react';

export const InputNumber = forwardRef((props, ref) => {
  // eslint-disable-next-line react/prop-types
  const { label = '', ...inputProps } = props;
  return (
    <div>
      <Typography.Title level={5}>{label}</Typography.Title>
      <InputNumberComp ref={ref} {...inputProps} style={{ width: '100%' }} />
    </div>
  );
});

InputNumber.displayName = 'InputNumber';
