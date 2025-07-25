class SensorMetadata:
    def Create_Sensor():
        return """
            INSERT INTO sensor_based_data
                        (id, component_id, equipment_id, name, failure_mode_id, frequency, unit,
                        min_value, max_value, P, F)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
    ##Read.....

    def get_all_sensor_metadata():
        return """
        SELECT * FROM sensor_based_data
            """
    
    @staticmethod
    def get_sensor_metadata_wrt_componentid():
        return """
        SELECT * FROM vw_system_configuration WHERE component_id= ?
            """
    def Create_Sensor():
        return """
            """
    ##update.....
