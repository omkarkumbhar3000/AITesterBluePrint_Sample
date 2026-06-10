package com.salesforce.api.utils;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStream;
import java.util.*;

public class ExcelReader {
    public static List<Map<String, String>> readTestData(String filePath, String sheetName) {
        List<Map<String, String>> data = new ArrayList<>();
        try (InputStream is = ExcelReader.class.getClassLoader().getResourceAsStream(filePath);
             Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheet(sheetName);
            Row headerRow = sheet.getRow(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                Map<String, String> rowData = new HashMap<>();
                for (int j = 0; j < headerRow.getLastCellNum(); j++) {
                    Cell cell = row.getCell(j);
                    rowData.put(headerRow.getCell(j).getStringCellValue(),
                            cell != null ? getCellValueAsString(cell) : "");
                }
                data.add(rowData);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to read Excel data from " + filePath, e);
        }
        return data;
    }

    private static String getCellValueAsString(Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
